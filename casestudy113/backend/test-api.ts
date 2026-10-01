import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import http from "http";

let mongoServer: MongoMemoryServer;
let server: http.Server;

const BASE_URL = "http://localhost:5001/api";

async function runTests() {
  console.log("=== Starting Test Suite for Hostel Room Allocation System ===");

  // 1. Setup in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;
  process.env.PORT = "5001";
  process.env.JWT_SECRET = "test_secret_key";

  // 2. Import Express app
  const app = (await import("./src/server")).default;

  // Wait a moment for mongoose to connect
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}${detail ? " - " + detail : ""}`);
      failed++;
    }
  }

  try {
    // Test 1: Root endpoint
    const rootRes = await fetch("http://localhost:5001/api");
    const rootData = await rootRes.json();
    assert(rootRes.status === 200 && rootData.message === "Hostel Room Allocation API", "GET /api returns welcome message");

    // Test 2: Register Student
    const regStudentRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Student One",
        email: "student1@test.com",
        password: "password123",
        role: "student"
      })
    });
    const regStudentData = await regStudentRes.json();
    assert(regStudentRes.status === 201 && regStudentData.user.role === "student", "POST /api/auth/register - Student registration");

    // Test 3: Register Warden
    const regWardenRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Warden Bob",
        email: "warden@test.com",
        password: "password123",
        role: "warden"
      })
    });
    const regWardenData = await regWardenRes.json();
    assert(regWardenRes.status === 201 && regWardenData.user.role === "warden", "POST /api/auth/register - Warden registration");

    // Test 4: Prevent duplicate email registration
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Student Dup",
        email: "student1@test.com",
        password: "password123"
      })
    });
    assert(dupRes.status === 400, "POST /api/auth/register - Rejects duplicate email with 400");

    // Test 5: Missing fields validation on register
    const missingRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "missing@test.com" })
    });
    assert(missingRes.status === 400, "POST /api/auth/register - Rejects missing fields with 400");

    // Test 6: Login Student
    const loginStudentRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "student1@test.com",
        password: "password123"
      })
    });
    const loginStudentData = await loginStudentRes.json();
    const studentToken = loginStudentData.token;
    assert(loginStudentRes.status === 200 && !!studentToken, "POST /api/auth/login - Student login returns JWT token");

    // Test 7: Login Warden
    const loginWardenRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "warden@test.com",
        password: "password123"
      })
    });
    const loginWardenData = await loginWardenRes.json();
    const wardenToken = loginWardenData.token;
    assert(loginWardenRes.status === 200 && !!wardenToken, "POST /api/auth/login - Warden login returns JWT token");

    // Test 8: Login with invalid password
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "student1@test.com",
        password: "wrongpassword"
      })
    });
    assert(badLoginRes.status === 400, "POST /api/auth/login - Invalid password rejected with 400");

    // Test 9: Auth middleware rejects request without token
    const noAuthRes = await fetch(`${BASE_URL}/rooms`);
    assert(noAuthRes.status === 401, "GET /api/rooms - Rejected without token (401)");

    // Test 10: Auth middleware rejects invalid token
    const badAuthRes = await fetch(`${BASE_URL}/rooms`, {
      headers: { Authorization: "Bearer invalid.token.value" }
    });
    assert(badAuthRes.status === 401, "GET /api/rooms - Rejected with invalid token (401)");

    // Test 11: Role authorization - Student CANNOT create room (warden only)
    const studentCreateRoomRes = await fetch(`${BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ roomNumber: "999", capacity: 4 })
    });
    assert(studentCreateRoomRes.status === 403, "POST /api/rooms - Student forbidden from creating room (403)");

    // Test 12: Warden creates Room 101 with capacity 2
    const createRoomRes = await fetch(`${BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ roomNumber: "101", capacity: 2 })
    });
    const room101 = await createRoomRes.json();
    assert(
      createRoomRes.status === 201 && room101.roomNumber === "101" && room101.capacity === 2 && room101.occupiedCount === 0,
      "POST /api/rooms - Warden creates room 101 with capacity 2 and occupiedCount 0"
    );

    // Test 13: Warden creates Room 102 for update and delete testing
    const createRoom102Res = await fetch(`${BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ roomNumber: "102", capacity: 3 })
    });
    const room102 = await createRoom102Res.json();
    assert(createRoom102Res.status === 201, "POST /api/rooms - Warden creates room 102");

    // Test 14: Prevent duplicate room number
    const dupRoomRes = await fetch(`${BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ roomNumber: "101", capacity: 2 })
    });
    assert(dupRoomRes.status === 400, "POST /api/rooms - Prevent duplicate roomNumber (400)");

    // Test 15: View rooms (both student and warden can view)
    const getRoomsRes = await fetch(`${BASE_URL}/rooms`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const roomsList = await getRoomsRes.json();
    assert(getRoomsRes.status === 200 && roomsList.length === 2, "GET /api/rooms - Student views rooms list");

    // Test 16: Warden updates Room 102 capacity
    const updateRoomRes = await fetch(`${BASE_URL}/rooms/${room102._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ capacity: 4 })
    });
    const updatedRoom102 = await updateRoomRes.json();
    assert(updateRoomRes.status === 200 && updatedRoom102.capacity === 4, "PATCH /api/rooms/:id - Warden updates room capacity");

    // Test 17: Warden deletes Room 102
    const deleteRoomRes = await fetch(`${BASE_URL}/rooms/${room102._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${wardenToken}` }
    });
    assert(deleteRoomRes.status === 200, "DELETE /api/rooms/:id - Warden deletes empty room");

    // Test 18: Role authorization - Warden CANNOT request allocation (student only)
    const wardenReqAllocRes = await fetch(`${BASE_URL}/allocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ roomId: room101._id })
    });
    assert(wardenReqAllocRes.status === 403, "POST /api/allocations - Warden forbidden from requesting room (403)");

    // Test 19: Student 1 requests allocation for Room 101
    const allocReq1 = await fetch(`${BASE_URL}/allocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ roomId: room101._id })
    });
    const alloc1 = await allocReq1.json();
    assert(allocReq1.status === 201 && alloc1.status === "pending", "POST /api/allocations - Student 1 requests room (status: pending)");

    // Test 20: occupiedCount MUST NOT increase on request (remains 0)
    const checkRoomAfterReq1 = await (await fetch(`${BASE_URL}/rooms`, { headers: { Authorization: `Bearer ${studentToken}` } })).json();
    const room101AfterReq1 = checkRoomAfterReq1.find((r: any) => r._id === room101._id);
    assert(room101AfterReq1.occupiedCount === 0, "Requirement check: occupiedCount remains 0 after allocation request");

    // Test 21: Student 1 CANNOT create duplicate active allocation
    const dupAllocRes = await fetch(`${BASE_URL}/allocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ roomId: room101._id })
    });
    assert(dupAllocRes.status === 400, "POST /api/allocations - Prevent duplicate pending allocation (400)");

    // Test 22: Student CANNOT approve allocation (warden only)
    const studentApproveRes = await fetch(`${BASE_URL}/allocations/${alloc1._id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ status: "approved" })
    });
    assert(studentApproveRes.status === 403, "PATCH /api/allocations/:id/status - Student forbidden from approving (403)");

    // Test 23: Warden approves Student 1 allocation
    const wardenApprove1 = await fetch(`${BASE_URL}/allocations/${alloc1._id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ status: "approved" })
    });
    assert(wardenApprove1.status === 200, "PATCH /api/allocations/:id/status - Warden approves Student 1 allocation");

    // Test 24: occupiedCount MUST increase by 1 (now 1)
    const checkRoomAfterApprove1 = await (await fetch(`${BASE_URL}/rooms`, { headers: { Authorization: `Bearer ${studentToken}` } })).json();
    const room101AfterApprove1 = checkRoomAfterApprove1.find((r: any) => r._id === room101._id);
    assert(room101AfterApprove1.occupiedCount === 1, "Requirement check: occupiedCount increased to 1 after approval");

    // Test 25: Cannot re-approve an already approved allocation
    const reApproveRes = await fetch(`${BASE_URL}/allocations/${alloc1._id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ status: "approved" })
    });
    assert(reApproveRes.status === 400, "PATCH /api/allocations/:id/status - Reject re-processing already approved allocation (400)");

    // Test 26: Register Student 2
    await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Student Two",
        email: "student2@test.com",
        password: "password123",
        role: "student"
      })
    });
    const loginStudent2Res = await (await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student2@test.com", password: "password123" })
    })).json();
    const student2Token = loginStudent2Res.token;

    // Test 27: Student 2 requests Room 101 and Warden approves it
    const allocReq2 = await (await fetch(`${BASE_URL}/allocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${student2Token}`
      },
      body: JSON.stringify({ roomId: room101._id })
    })).json();

    const wardenApprove2 = await fetch(`${BASE_URL}/allocations/${allocReq2._id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ status: "approved" })
    });
    assert(wardenApprove2.status === 200, "PATCH /api/allocations/:id/status - Warden approves Student 2 allocation");

    // Test 28: Room 101 occupiedCount MUST now be 2 (equal to capacity 2)
    const checkRoomAfterApprove2 = await (await fetch(`${BASE_URL}/rooms`, { headers: { Authorization: `Bearer ${studentToken}` } })).json();
    const room101AfterApprove2 = checkRoomAfterApprove2.find((r: any) => r._id === room101._id);
    assert(room101AfterApprove2.occupiedCount === 2, "Requirement check: occupiedCount is now 2 (Room 101 is FULL)");

    // Test 29: Register Student 3
    await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Student Three",
        email: "student3@test.com",
        password: "password123",
        role: "student"
      })
    });
    const loginStudent3Res = await (await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student3@test.com", password: "password123" })
    })).json();
    const student3Token = loginStudent3Res.token;

    // Test 30: Student 3 tries to request Room 101 when full -> Rejected with 400 "Room is full"
    const reqFullRoomRes = await fetch(`${BASE_URL}/allocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${student3Token}`
      },
      body: JSON.stringify({ roomId: room101._id })
    });
    const reqFullRoomData = await reqFullRoomRes.json();
    assert(
      reqFullRoomRes.status === 400 && reqFullRoomData.message === "Room is full",
      "POST /api/allocations - Student request rejected when room is full (400 'Room is full')"
    );

    // Test 31: Test capacity check at approval time (in case room filled while request was pending)
    // Directly insert a pending allocation into DB for room 101 to simulate race condition
    const AllocationModel = mongoose.model("Allocation");
    const fakePending = await AllocationModel.create({
      student: loginStudent3Res.user.id,
      room: room101._id,
      status: "pending"
    });
    const approveFullRoomRes = await fetch(`${BASE_URL}/allocations/${fakePending._id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ status: "approved" })
    });
    const approveFullRoomData = await approveFullRoomRes.json();
    assert(
      approveFullRoomRes.status === 400 && approveFullRoomData.message === "Room is full",
      "CRITICAL GRADING REQUIREMENT: Warden approval blocked when room.occupiedCount >= capacity (400 'Room is full')"
    );

    // Test 32: Confirm occupiedCount is still safely 2 (never exceeds capacity)
    const checkRoomFinal = await (await fetch(`${BASE_URL}/rooms`, { headers: { Authorization: `Bearer ${studentToken}` } })).json();
    const room101Final = checkRoomFinal.find((r: any) => r._id === room101._id);
    assert(room101Final.occupiedCount === 2, "CRITICAL REQUIREMENT: occupiedCount never exceeds capacity (remains 2)");

    // Test 33: Prevent setting capacity below occupiedCount
    const badCapacityRes = await fetch(`${BASE_URL}/rooms/${room101._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ capacity: 1 })
    });
    assert(badCapacityRes.status === 400, "PATCH /api/rooms/:id - Prevent capacity < occupiedCount (400)");

    // Test 34: Prevent deleting room with occupied beds
    const badDeleteRes = await fetch(`${BASE_URL}/rooms/${room101._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${wardenToken}` }
    });
    assert(badDeleteRes.status === 400, "DELETE /api/rooms/:id - Prevent deleting occupied room (400)");

    // Test 35: Rejection workflow - Register Student 4 and Room 201
    await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Student Four",
        email: "student4@test.com",
        password: "password123",
        role: "student"
      })
    });
    const loginStudent4Res = await (await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student4@test.com", password: "password123" })
    })).json();

    const room201 = await (await fetch(`${BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ roomNumber: "201", capacity: 1 })
    })).json();

    const allocReq4 = await (await fetch(`${BASE_URL}/allocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginStudent4Res.token}`
      },
      body: JSON.stringify({ roomId: room201._id })
    })).json();

    const rejectRes = await fetch(`${BASE_URL}/allocations/${allocReq4._id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ status: "rejected" })
    });
    assert(rejectRes.status === 200, "PATCH /api/allocations/:id/status - Warden rejects allocation request");

    // Check Room 201 occupiedCount is still 0
    const checkRoom201 = await (await fetch(`${BASE_URL}/rooms`, { headers: { Authorization: `Bearer ${studentToken}` } })).json();
    const room201Data = checkRoom201.find((r: any) => r._id === room201._id);
    assert(room201Data.occupiedCount === 0, "Requirement check: Rejection does not increase occupiedCount (remains 0)");

    // Test 36: Student 4 can request again after rejection
    const allocReq4Again = await fetch(`${BASE_URL}/allocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginStudent4Res.token}`
      },
      body: JSON.stringify({ roomId: room201._id })
    });
    assert(allocReq4Again.status === 201, "POST /api/allocations - Rejected allocation does not block new request");

    // Test 37: Invalid IDs handling
    const invalidIdRes = await fetch(`${BASE_URL}/allocations/invalid-id-123/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wardenToken}`
      },
      body: JSON.stringify({ status: "approved" })
    });
    assert(invalidIdRes.status === 400, "PATCH /api/allocations/:id/status - Invalid ObjectId returns 400");

    console.log(`\n========================================`);
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(0);
  }
}

runTests();
