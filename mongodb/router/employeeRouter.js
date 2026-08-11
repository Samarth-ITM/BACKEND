const expreess=require('express')

const Employee=required("../models/Employee")
const router=express.router();

router.get("/",(request, response)=>{
    try{
        const employee=Employee.find({});
        reponse.status(200).json(employee)
    }
    catch(error){
        response.stats(500).json({message:error.message})
    }
});

router.get('/:id', async(request, response)=>{
    try{
        const employee= await Employee.findById({request:params.id});
        response.status(200).json(employee)
    }
        catch(error){
            response.status(500).json({message:error.message})
        }
})


router.post('/', async (request,response)=>{
    try{
        const newEmployee = {
            name: request.body.name,
            email: request.body.email,
            department: request.body.department,
            role: request.body.role,
            salary: request.body.role
        }
    const employee= new Employee(newEmployee)
    await employee.save();
    response.status(200).json({message:"Employee created successfully", employee})
    }
    catch(error){
        response.status(500).json({message:error.message})
    }
})


router.put('/:id', async(request, response)=>{
    try{
        const empoyee = await Employee.findByIdAndUpdate(request.params.id,request.body,{new:true})
        response.status(200).json(200).json({message:"Employee deleted successfully", employee});

        }
    catch(error){
        response.status(500).json({message:error.message})
    }});