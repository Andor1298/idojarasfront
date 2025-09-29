// -------------------- STEPS ---------------

// GET all steps by userId
app.get('/steps/user/:uid', (req, res) => {
    let uid = Number(req.params.uid);
    let idx = users.findIndex(user => user.id == uid)

    if (idx == -1) {
        res.status(400).send({msg: "Nincs ilyen felhasznalo"});
        return;
    }

    res.send(steps.filter(step => step.uid == uid));

    /* let matchSteps = [];
    steps.forEach(step => {
        if (step.uid === uid) {
            matchSteps.push(step);
        }
    });
    res.send(matchSteps); */
});


// GET one step by id

app.get('/steps/:id', (req, res) => {
    let id = req.params.id;
    let idx = steps.findIndex(step => step.id == id);
    if (idx > -1) {
        return res.send(steps[idx]);
    }
    return res.status(400).send({msg: "Nincs ilyen azonosítójú lépésszám!"});
});

// POST new step by uid

app.post('/steps/upload/:uid', (req, res) => {
    let data = req.body;
    let uid = Number(req.params.uid);
    steps.push(data);
    data.id = getNextStepID();
    data.uid = uid;
    saveSteps();
    res.send({msg: 'A lépés felvéve!'});
})

// PATCH step by id
app.patch('/steps/:id', (req, res) => {
    let data = req.body;
    let id = Number(req.params.id);

    let newDate = data.newDate;
    let newCount = Number(data.newCount);

    steps.forEach(step => {
        if (step.id === id) {
            step.date = newDate;
            step.count = newCount;
        }
    });
    saveSteps();
    res.send({msg: 'Sikeres módosítás'})
});


// DELETE step by id
app.delete('/steps/:id', (req, res) => {
    let id = Number(req.params.id);
    let idx = steps.findIndex(step => step.id == id);

    if (idx > -1) {
        steps.splice(idx, 1);
        saveSteps();
        return res.status(200).send({msg: 'Sikeres törlés'})
    }
    return res.status(400).send({msg: "Nincs ilyen azonosítójú lépésszám!"});
})


// DELETE all steps by userId
app.delete('/steps/users/:uid', (req, res) => {
    let uid = Number(req.params.uid);
    let idx = users.findIndex(user => user.id == uid)

    if (idx == -1) {
        res.status(400).send({msg: "Nincs ilyen felhasználó!"});
        return;
    }

    let newSteps = steps.filter(step => step.uid != uid);
    steps = newSteps;

    saveSteps();
    res.send({msg: 'Lépésadatok sikeresen törölve'})
});

app.listen(3000);

function getNextID() {
    const maxId = users.reduce((max, u) => {
        const id = Number(u?.id);
        return Number.isFinite(id) && id > max ? id : max;
    }, 0);
    return maxId + 1;
}

function getNextStepID() {
    const maxId = steps.reduce((max, u) => {
        const id = Number(u?.id);
        return Number.isFinite(id) && id > max ? id : max;
    }, 0);
    return maxId + 1;
}

function loadSteps(){
    if (fs.existsSync(STEPS_FILE)) {
        const raw = fs.readFileSync(STEPS_FILE);
        try {
            steps = JSON.parse(raw);
        } catch (err) {
            console.log('Hiba', error)
            steps = []
        }
    } else {
        saveSteps();
    }
}

function saveSteps() {
    fs.writeFileSync(STEPS_FILE, JSON.stringify(steps));
}

function loadUsers() {
    if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE);
        try {
            users = JSON.parse(raw);
        } catch (error) {
            console.log('Hiba az adatok beolvasása közben', error)
            users = [];
        }
    } else {
        saveUsers();
    }
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
}


function isEmailExists(email) {
    let exists = false;
    users.forEach(user => {
        if (user.email == email) {
            exists = true;
            return exists;
        }
    });
    return exists;
}