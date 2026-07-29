class Programming {
    constructor() {
        this.id = "";
        this.name = "";
        this.course = [];
    }

    setId(id) {
        this.id = id;
    }

    setName(name) {
        this.name = name;
    }

    setCourse(course) {
        this.course = course;
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }

    getCourse() {
        return this.course;
    }
}

p1 = new Programming();
p1.setId("1");
p1.setName("Samarth");
p1.setCourse(["JavaScript", "Python", "C++"]);
console.log(p1.getId());
console.log(p1.getName());
console.log(p1.getCourse());
