document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("taskList");
    const scoreElement = document.getElementById("score");
    let score = parseInt(localStorage.getItem("score")) || 0; // Cargar el puntaje desde localStorage
    scoreElement.textContent = score;

    let tasks = []; // Array para almacenar todas las tareas
    let visibleTasks = []; // Array para almacenar las tareas visibles (máximo 3)
    const completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
    const deletedTasks = JSON.parse(localStorage.getItem("deletedTasks")) || [];

    // Cargar tareas desde el JSON
    fetch("tasks.json")
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");
            return response.json();
        })
        .then(loadedTasks => {
            tasks = loadedTasks;
            initializeVisibleTasks(); // Inicializar las tareas visibles
        })
        .catch(error => console.error("Error al cargar tareas:", error));

    // Función para inicializar las tareas visibles
    function initializeVisibleTasks() {
        // Filtrar tareas ya completadas o eliminadas
        const availableTasks = tasks.filter((task, index) => {
            return !completedTasks.includes(index) && !deletedTasks.includes(index);
        });

        // Seleccionar las primeras 3 tareas disponibles
        visibleTasks = availableTasks.slice(0, 3).map(task => tasks.indexOf(task));

        // Mostrar las tareas visibles
        visibleTasks.forEach(index => addTaskToDOM(tasks[index], index));
    }

    // Función para agregar una nueva tarea visible
    function addNewVisibleTask() {
        const availableTasks = tasks.filter((task, index) => {
            return !completedTasks.includes(index) && !deletedTasks.includes(index) && !visibleTasks.includes(index);
        });
    
        if (availableTasks.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableTasks.length); // Seleccionar una tarea al azar
            const newTaskIndex = tasks.indexOf(availableTasks[randomIndex]);
            visibleTasks.push(newTaskIndex);
            addTaskToDOM(tasks[newTaskIndex], newTaskIndex);
        }
    }

    // Función para agregar una tarea al DOM
    function addTaskToDOM(task, index) {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task");

        taskDiv.innerHTML = `
            <div><h1>#${index + 1}</h1></div>
            <div class="texto">
                <h2>${task.name}</h2>
                <p>${task.description}</p>
            </div>
            <div class="acciones">
                <button class="completeTask">Completar</button>
                <button class="deleteTask">X</button>
            </div>     
        `;

        // Botón de completar tarea
        taskDiv.querySelector(".completeTask").addEventListener("click", () => {
            score += task.difficulty;
            scoreElement.textContent = score;
            Swal.fire("¡Bien hecho!", `Ganaste ${task.difficulty} puntos!`, "success");
            taskDiv.remove(); // Eliminar después de completarla

            // Guardar el puntaje y la tarea completada en localStorage
            localStorage.setItem("score", score);
            completedTasks.push(index);
            localStorage.setItem("completedTasks", JSON.stringify(completedTasks));

            // Reemplazar la tarea completada por una nueva
            visibleTasks = visibleTasks.filter(taskIndex => taskIndex !== index); // Eliminar la tarea completada de las visibles
            addNewVisibleTask(); // Agregar una nueva tarea visible
        });

        // Botón de eliminar tarea
        taskDiv.querySelector(".deleteTask").addEventListener("click", () => {
            // Sanción: restar puntos proporcionales a la dificultad
            score -= task.difficulty;
            scoreElement.textContent = score;
            Swal.fire("¡Tarea eliminada!", `Se restaron ${task.difficulty} puntos.`, "warning");
            taskDiv.remove();

            // Guardar el puntaje y la tarea eliminada en localStorage
            localStorage.setItem("score", score);
            deletedTasks.push(index);
            localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));

            // Reemplazar la tarea eliminada por una nueva
            visibleTasks = visibleTasks.filter(taskIndex => taskIndex !== index); // Eliminar la tarea eliminada de las visibles
            addNewVisibleTask(); // Agregar una nueva tarea visible
        });

        // Agregar la tarea al div taskList
        taskList.appendChild(taskDiv);
    }

    // Función para reiniciar el progreso
    window.resetProgress = () => {
        localStorage.removeItem("score");
        localStorage.removeItem("completedTasks");
        localStorage.removeItem("deletedTasks");
        location.reload(); // Recargar la página para aplicar los cambios
    };
});