
window.addEventListener('load', () => {
    const form = document.querySelector("#new-task-form");
    const input = document.querySelector("#new-task-input");
    const list_el = document.querySelector("#tasks");
    const taskEditBtnElements = document.getElementsByClassName("edit");
    var taskInputId = null;
    var editFunction = function () {
        taskInputId = this.getAttribute("data-id");
        var taskInputEl = document.getElementById(taskInputId);
        if (this.innerText.toLowerCase() == "edit") {

            // edit task using its id
            if (taskInputEl != undefined && taskInputEl != null) {
                taskInputEl.removeAttribute("readonly");
                taskInputEl.focus();
                this.innerText = "save";
            }
        } else {
            if (taskInputId != null) {
                var editUrl = window.location.origin + '/todo/' + taskInputId;
                const headers = {
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Connection': 'keep-alive',
                        'Accept': '*',
                    },
                    body: new URLSearchParams({
                        "title": taskInputEl.value,
                        "id": taskInputId
                    }),
                    method: "PUT"
                }
                fetch(editUrl, headers).then(response => {
                    console.log(response);
                    const isJson = response.headers.get('content-type')?.includes('application/json');
                    const data = isJson && response.json();

                    // check for error response
                    if (!response.ok) {
                        // get error message from body or default to response status
                        const error = (data && data.message) || response.statusText;
                        console.log(error)
                        return Promise.reject(error);
                    }
                }).catch(error => {
                    console.log(error);
                    alert("Error saving to database");
                });
                taskInputEl.setAttribute("readonly", "readonly");
                this.innerText = "Edit";
            }
        }
    };
    Array.from(taskEditBtnElements).forEach(function (element) {
        element.addEventListener('click', editFunction);
    });

    const taskDeleteBtnElements = document.getElementsByClassName("delete");
    var deleteFunction = function () {
        if (confirm('Do you really want to delete this?')) {
            // Save it!
            console.log('Thing was saved to the database.');
            
        } else {
            // Do nothing!
            console.log('Thing was not saved to the database.');
        }
        // list_el.removeChild(task_el);
    }
    Array.from(taskDeleteBtnElements).forEach(function (element) {
        element.addEventListener('click', deleteFunction);
    });

    // fetch todos
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const task = input.value;

        if (!task) {
            alert("Please fill out the task");
            return;
        }

        var createUrl = window.location.origin + '/todo';
        const headers = {
            mode: 'no-cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
                'Accept': '*',
            },
            body: new URLSearchParams({
                "title": task,
            }),
            method: "POST"
        }
        fetch(createUrl, headers)
        .then(response => response.json())
        .then((data) => {
            console.log(data);
            // if(data != undefined && data != null) {
            //     console.log(data);
            //     const task_el = document.createElement("div");
            //     task_el.classList.add("task");

            //     const task_content_el = document.createElement("div");
            //     task_content_el.classList.add("content");

            //     task_el.appendChild(task_content_el);

            //     const task_input_el = document.createElement("input");
            //     task_input_el.id = data['id'];
            //     task_input_el.classList.add("text");
            //     task_input_el.type = "text";
            //     task_input_el.value = task;
            //     task_input_el.setAttribute("readonly", "readonly");

            //     task_content_el.appendChild(task_input_el);

            //     const task_actions_el = document.createElement("div");
            //     task_actions_el.classList.add("actions");

            //     const task_edit_el = document.createElement("button");
            //     task_edit_el.setAttribute("data_id", data['id']);
            //     task_edit_el.classList.add("edit");
            //     task_edit_el.innerHTML = "Edit";

            //     const task_delete_el = document.createElement("button");
            //     task_delete_el.setAttribute("data_id", data['id']);
            //     task_delete_el.classList.add("delete");
            //     task_delete_el.innerHTML = "Delete";

            //     task_actions_el.appendChild(task_edit_el);
            //     task_actions_el.appendChild(task_delete_el);

            //     task_el.appendChild(task_actions_el)

            //     list_el.appendChild(task_el);

            //     input.value = "";
            // }
            if(data != undefined && data != null){
                location.reload();
            }
        }).catch(error => {
            console.log(error);
            alert("Error saving to database");
        });

    });
});