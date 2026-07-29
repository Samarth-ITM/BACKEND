const express = require('express');
const app = express();
const port = 4000;

let college = []

app.get('/colleges', (request, response) => {
    try {
        response.status(200).json(college)
    } catch (error) { response.status(500).json(error) }
});

app.get('/colleges/:id', (request, response) => {
    try {
        const id = request.params.id;
        const collegeData = college.find((c) => c.id == request.params.id);
        if (!collegeData) {
            response.status(404).json({ message: 'College not found' });
        } else {
            response.status(200).json(collegeData)
        }
    } catch (error) { response.status(500).json(error) }
});

app.post('/colleges', (request, response) => {
    try {
        const newcollege = {
            id: college.length + 1,
            name: college.body.name,
            location: request.body.location
        }
        college.push(newcollege)
        response.status(200).json({ message: "College Added Successfully!" })
    } catch (error) { response.status(500).json(error) }
}
)


app.put('/colleges/:id', (request, response) => {
    try {

        const college = colleges.find((c) => c.id == request.params.id)
        if (!college) {
            return response.status(404).json({ message: "College Not Found" })
        }
    }
    catch (error) {
        response.status(500).json(error)
    }
})

app.delete('/colleges/:id', (request, response) => {
    try {
        const collegeIndex = colleges.findIndex(c => c.id == request.params.id)
        if (collegeIndex === -1) {
            return response.status(404).json({ message: "College Not Found" })
        }
        else {
            colleges.splice(collegeIndex, 1)
            response.status(200).json({ message: "College Deleted Successfully!" })
        }
    }
    catch (error) {
        response.status(500).json(error)
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});