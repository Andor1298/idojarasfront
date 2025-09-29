let steps = []
let editMode = false;
let selectedStep = null;

function setDate() {
    let today = new Date().toISOString().split('T')[0];
    let dateField = document.getElementById("dateField");
    dateField.setAttribute('max', today);
}

async function add() {
    let date = document.getElementById("dateField").value;
    let stepcount = document.getElementById("stepCountField").value;

    if (date == '' || stepcount == '') {
        showMessage('danger', 'Hiba', 'Nem adtál meg minden adatot!');
        return;

        // ha az adott napra van már lépésadat akkor update, ha nincs akkor insert
    }

    let idx = steps.findIndex(step => step.date == date && step.uid == loggedUser.id);
    if (idx == -1) {
        // ha nincs akkor insert
        try {
            let res = await fetch(`${ServerUrl}/steps/upload/${loggedUser.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: date,
                    count: Number(stepcount)
                })
            });
            let data = await res.json();
            if (res.status == 200) {
                showMessage('success', 'Ok', data.msg);
                await getSteps();
                cancel();
                renderSteps();
            } else {
                showMessage('danger', 'Hiba', data.msg);
            }
        } catch (err) {
            console.log(err);
            showMessage('danger', 'Hiba', 'Hiba az adatok lekérdezése során');
        }
    } else {
        // ha van akkor update
        try {
            let res = await fetch(`${ServerUrl}/steps/${steps[idx].id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newDate: date,
                    newCount: steps[idx].count + Number(stepcount)
                })
            });
            let data = await res.json();
            if (res.status == 200) {
                showMessage('success', 'Ok', data.msg);
                await getSteps();
                renderSteps();
            } else {
                showMessage('danger', 'Hiba', data.msg);
            }
        } catch (err) {
            console.log(err);
            showMessage('danger', 'Hiba', 'Hiba az adatok lekérdezése során');
        }
    }
}

async function getSteps() {
    try {
        let res = await fetch(`${ServerUrl}/steps/user/${loggedUser.id}`);
        let data = await res.json();
        data.sort((a,b) => new Date(b.date) - new Date(a.date));
        steps = data;
        
    } catch (error) {
        console.log(error);
        showMessage('danger', 'Hiba', 'Hiba az adatok lekérdezése során');
    }
}

function renderSteps() {
    let tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    let sumSpan = document.getElementById('stepSumSpan');
    let sum = 0;
    steps.forEach((step, index) => {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let td4 = document.createElement('td');
        let editBtn = document.createElement('button');
        let deleteBtn = document.createElement('button');

        editBtn.classList.add('btn', 'btn-warning', 'btn-sm', 'me-2');
        deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');

        editBtn.setAttribute('onclick', `editStep(${index})`);
        deleteBtn.setAttribute('onclick', `deleteStep(${index})`);

        editBtn.innerHTML = '<i class="bi bi-pencil-fill"></i>'
        deleteBtn.innerHTML = '<i class="bi bi-trash-fill"></i>'

        td1.innerHTML = (index + 1) + '.';
        td2.innerHTML = step.date;
        td3.innerHTML = step.count;
        td4.appendChild(editBtn);
        td4.appendChild(deleteBtn);

        td1.classList.add('text-center');
        td3.classList.add('text-end');
        td4.classList.add('text-end');

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tbody.appendChild(tr);

        sum += Number(step.count);
    });

    sumSpan.innerHTML = sum;
}

async function update() {
    /*
        Ha a dátum nem változott -> lépésszám frissítése a selectedStep-re
        Ha a dátum változott -> eredeti törlése majd
            ha még nincs ilyen dátum -> insert új adatokkal
            ha van ilyen dátum -> frissítés az új lépésszámra
    */

    let date = document.getElementById("dateField");
    let stepcount = document.getElementById("stepCountField");

    if (selectedStep.date == date.value) {
        try {
            let res = await fetch(`${ServerUrl}/steps/${selectedStep.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newDate: date.value,
                    newCount: Number(stepcount.value)
                })
            });
            let data = await res.json();
            if (res.status == 200) {
                showMessage('success', 'Ok', data.msg);
                await getSteps();
                renderSteps();
            } else {
                showMessage('danger', 'Hiba', data.msg);
            }
        } catch (err) {
            console.log(err);
            showMessage('danger', 'Hiba', 'Hiba az adatok lekérdezése során');
        }
    } else {
        try {
            let res = await fetch(`${ServerUrl}/steps/${selectedStep.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let data = await res.json();
            if (res.status == 200) {
                //showMessage('success', 'Ok', data.msg);
                //await getSteps();
                //cancel();
                //renderSteps();
            } else {
                showMessage('danger', 'Hiba', data.msg);
            }
        } catch (err) {
            console.log(err);
            showMessage('danger', 'Hiba', 'Hiba az adatok törlése során');
        }

        let idx = steps.findIndex(step => step.date == date && step.uid == loggedUser.id);
        if (idx == -1) {
            // ha nincs akkor insert
            try {
                let res = await fetch(`${ServerUrl}/steps/upload/${loggedUser.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: date.value,
                        count: Number(stepcount.value)
                    })
                });
                let data = await res.json();
                if (res.status == 200) {
                    showMessage('success', 'Ok', data.msg);
                    await getSteps();
                    cancel();
                    renderSteps();
                } else {
                    showMessage('danger', 'Hiba', data.msg);
                }
            } catch (err) {
                console.log(err);
                showMessage('danger', 'Hiba', 'Hiba az adatok lekérdezése során');
            }
        } else {
            // ha van akkor update
            try {
                let res = await fetch(`${ServerUrl}/steps/${steps[idx].id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        newDate: date.value,
                        newCount: Number(stepcount.value)
                    })
                });
                let data = await res.json();
                if (res.status == 200) {
                    showMessage('success', 'Ok', data.msg);
                    await getSteps();
                    renderSteps();
                } else {
                    showMessage('danger', 'Hiba', data.msg);
                }
            } catch (err) {
                console.log(err);
                showMessage('danger', 'Hiba', 'Hiba az adatok lekérdezése során');
            }
        }
    }
}

async function del() {
    let idx = steps.findIndex(step => step.id == selectedStep.id)
    await deleteStep(idx);
}

function editStep(index) {
    let date = document.getElementById("dateField");
    let stepcount = document.getElementById("stepCountField");

    toggleMode(true);
    date.value = steps[index].date;
    stepcount.value = steps[index].count
    selectedStep = steps[index];
}

async function deleteStep(index) {
    console.log(index);
    if (confirm('Biztosan törlöd a lépésadatot?')) {
        try {
            let res = await fetch(`${ServerUrl}/steps/${steps[index].id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let data = await res.json();
            if (res.status == 200) {
                showMessage('success', 'Ok', data.msg);
                await getSteps();
                cancel();
                renderSteps();
            } else {
                showMessage('danger', 'Hiba', data.msg);
            }
        } catch (err) {
            console.log(err);
            showMessage('danger', 'Hiba', 'Hiba az adatok törlése során');
        }
    }
}

function cancel() {
    toggleMode(false);
    let date = document.getElementById("dateField");
    let stepcount = document.getElementById("stepCountField");
    date.value = null;
    stepcount.value = null;
}

function toggleMode(mode) {
    let addBtn = document.getElementById('addBtn');
    let editBtn = document.getElementById('updateBtn');
    let delBtn = document.getElementById('delBtn');
    let cancelBtn = document.getElementById('cancelBtn');
    
    if (mode) {
        addBtn.classList.add('hide');
        editBtn.classList.remove('hide');
        delBtn.classList.remove('hide');
        cancelBtn.classList.remove('hide');
    } else {
        addBtn.classList.remove('hide');
        editBtn.classList.add('hide');
        delBtn.classList.add('hide');
        cancelBtn.classList.add('hide');
    }
}