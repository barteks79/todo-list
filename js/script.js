'use strict';

let taskID = 1;
let taskToEdit;
// main
let addTaskBtn;
let deadlineSelect;
let tasksArea;
let allTaskBoxes;
let noTasksText;
let onlyShownTasks;

// modals
let addModal;
let editModal;
let confirmAddBtn;
let confirmEditBtn;
let addTaskInput;
let addTaskDate;
let addTaskTime;
let editTaskInput;
let editTaskDate;
let editTaskTime;
let cancelBtns;
let addFillUpErrors;
let editFillUpErrors;

const prepareDOMElements = () => {
	// main
	addTaskBtn = document.querySelector('.add');
	deadlineSelect = document.querySelector('#deadline');
	tasksArea = document.querySelector('.tasks');
	allTaskBoxes = document.getElementsByClassName('task-box');
	noTasksText = document.querySelector('.no-tasks');
	onlyShownTasks = document.getElementsByClassName('show-task');
	// modals
	addModal = document.querySelector('.add-modal');
	editModal = document.querySelector('.edit-modal');
	confirmAddBtn = addModal.querySelector('.confirm');
	confirmEditBtn = editModal.querySelector('.confirm');
	cancelBtns = document.querySelectorAll('.cancel');
	addTaskInput = addModal.querySelector('input');
	addTaskDate = addModal.querySelector('.date');
	addTaskTime = addModal.querySelector('.time');
	editTaskInput = editModal.querySelector('input');
	editTaskDate = editModal.querySelector('.date');
	editTaskTime = editModal.querySelector('.time');
	addFillUpErrors = addModal.querySelector('.fill-up-error');
	editFillUpErrors = editModal.querySelector('.fill-up-error');
};

const prepareDOMEvents = () => {
	addTaskBtn.addEventListener('click', openAddTaskModal);
	confirmAddBtn.addEventListener('click', handleTaskAdd);
	confirmEditBtn.addEventListener('click', saveTaskChanges);
	deadlineSelect.addEventListener('change', deadlineCheck);
	cancelBtns.forEach(btn => btn.addEventListener('click', handleModalClose));
};

const main = () => {
	prepareDOMElements();
	prepareDOMEvents();
};

// ------------------------ general -------------------------- //

const modalReset = () => {
	addTaskInput.value = '';
	addTaskDate.value = '';
	addTaskTime.value = '';
	addFillUpErrors.classList.remove('show-error');
};

const openAddTaskModal = () => {
	addModal.classList.add('active');
	modalReset();
};

const openEditTaskModal = () => {
	editModal.classList.add('active');
};

const handleModalClose = e => {
	e.target.closest('.modal').classList.remove('active');
};

const checkTasksQuantity = () => {
	onlyShownTasks.length > 0 ? noTasksText.classList.remove('show-p') : noTasksText.classList.add('show-p');
};

const addListenersToBtns = () => {
	// converting html collection to array => adding listeners for each button in every existing task
	Array.from(allTaskBoxes).forEach(task =>
		task.querySelectorAll('button').forEach(btn => btn.addEventListener('click', checkAction))
	);
};

// ------------------------ adding tasks -------------------------- //

const handleTaskAdd = () => {
	const taskName = addTaskInput.value;
	const taskDate = new Date(addTaskDate.value);
	const taskTime = addTaskTime.value;
	if (taskName !== '' && taskDate !== '' && taskTime !== '') {
		addModal.classList.remove('active');
	} else {
		addFillUpErrors.classList.add('show-error');
		return;
	}
	createTask(taskName, taskDate, taskTime);
	checkTasksQuantity();
};

const createTask = (taskName, taskDate, taskTime) => {
	const taskBox = document.createElement(`div`);
	taskBox.classList.add('task-box');
	taskBox.setAttribute('id', `task${taskID}`);

	const generatedTask = generateTask(taskName, taskDate, taskTime);
	taskBox.innerHTML = generatedTask;
	tasksArea.appendChild(taskBox);

	taskID++;
	deadlineCheck();
	addListenersToBtns();
};

// ------------------------ formating date/time -------------------------- //

const generateTask = (taskName, taskDate, taskTime) => {
	const formattedDate = formatDate(taskDate);
	const formattedTime = formatTimeTo12(taskTime);
	return `
		<div class="left">
			<p class="task-title">${taskName}</p>
			<p class="task-date">
				<span class="time">${formattedTime}</span>,
				<span class="date">${formattedDate}</span>
			</p>
		</div>
		<div class="right">
			<button class="finish"><i class="fa-solid fa-check"></i></button>
			<button class="remove"><i class="fa-solid fa-trash"></i></button>
			<button class="edit"><i class="fa-solid fa-pen"></i></button>
		</div>
	`;
};

const formatDate = date => {
	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
};

const formatTimeTo12 = time => {
	let hours = parseInt(time.slice(0, 2));
	if (hours > 12) {
		return `${hours - 12}:${time.slice(-2)} PM`;
	}
	return `${hours}:${time.slice(-2)} AM`;
};

const formatTimeTo24 = time => {
	let hours = parseInt(time.slice(0, 2));
	time.slice(-2) === 'PM' && (hours += 12);
	return `${hours.toString().padStart(2, '0')}:${time.split(':')[1].slice(0, 2)}`;
};

// ------------------------ taks action -------------------------- //

const checkAction = e => {
	const ref = e.target.closest('.task-box');
	e.target.classList.contains('finish') && completeTask(ref);
	e.target.classList.contains('remove') && removeTask(ref);
	e.target.classList.contains('edit') && editTask(ref);
};

const removeTask = currentTask => {
	currentTask.remove();
	checkTasksQuantity();
};

const completeTask = currentTask => {
	const taskTitle = currentTask.querySelector('.task-title');
	const finishButton = currentTask.querySelector('.finish');
	taskTitle.classList.toggle('completed');
	finishButton.classList.toggle('completed');
	deadlineCheck();
};

const editTask = currentTask => {
	openEditTaskModal();
	taskToEdit = currentTask.id.slice(-1);
	const taskName = currentTask.querySelector('.task-title').textContent;
	const taskDate = currentTask.querySelector('.date').textContent.split('/');
	const taskTime = formatTimeTo24(currentTask.querySelector('.time').textContent);
	console.log(taskTime);
	taskDate[1].length === 1 && (taskDate[1] = '0' + taskDate[1]);
	taskDate[0].length === 1 && (taskDate[0] = '0' + taskDate[0]);
	editTaskInput.value = taskName;
	editTaskDate.value = `${taskDate[2]}-${taskDate[1]}-${taskDate[0]}`;
	editTaskTime.value = taskTime;
	editFillUpErrors.classList.remove('show-error');
};

const saveTaskChanges = () => {
	const newTaskName = editTaskInput.value;
	const newTaskDateVal = editTaskDate.value;
	const newTaskDateObj = new Date(newTaskDateVal);
	const newTaskTime = editModal.querySelector('.time').value;
	if (newTaskName !== '' && newTaskDateVal !== '' && newTaskTime !== '') {
		editModal.classList.remove('active');
	} else {
		editFillUpErrors.classList.add('show-error');
		return;
	}
	const currentTask = document.querySelector(`#task${taskToEdit}`);
	currentTask.innerHTML = generateTask(newTaskName, newTaskDateObj, newTaskTime);
	addListenersToBtns();
	deadlineCheck();
};

// ------------------------ deadline -------------------------- //

const deadlineCheck = () => {
	const allTasksArray = Array.from(allTaskBoxes);
	const currentDateNotConverted = new Date();
	const currentDate = new Date(
		currentDateNotConverted.getFullYear(),
		currentDateNotConverted.getMonth() + 1,
		currentDateNotConverted.getDate()
	);
	switch (deadlineSelect.value) {
		case '0':
			showAll(allTasksArray);
			break;
		case '1':
			showToday(allTasksArray, currentDate);
			break;
		case '2':
			showThisWeek(allTasksArray, currentDate);
			break;
		case '3':
			showCompleted(allTasksArray);
			break;
	}
	checkTasksQuantity();
	deadlineSelect.addEventListener('change', deadlineCheck);
};

const showAll = allTasksArray => {
	allTasksArray.forEach(task => task.classList.add('show-task'));
};

const showToday = (allTasksArray, currentDate) => {
	allTasksArray.forEach(task => {
		task.classList.remove('show-task');
		const taskDateArray = task.querySelector('.date').innerHTML.split('/');
		if (
			taskDateArray[0] == currentDate.getDate() &&
			taskDateArray[1] == currentDate.getMonth() &&
			taskDateArray[2] == currentDate.getFullYear()
		) {
			task.classList.add('show-task');
		}
	});
};

const showThisWeek = (allTasksArray, currentDate) => {
	allTasksArray.forEach(task => {
		task.classList.remove('show-task');
		const userDateArray = task.querySelector('.date').innerHTML.split('/');
		const userDateObejct = new Date(userDateArray[2], userDateArray[1], userDateArray[0]);
		console.log(getNumberOfWeeks(userDateObejct), getNumberOfWeeks(currentDate));
		if (getNumberOfWeeks(userDateObejct) === getNumberOfWeeks(currentDate)) {
			task.classList.add('show-task');
		}
	});
};

const showCompleted = allTasksArray => {
	allTasksArray.forEach(task => {
		task.classList.remove('show-task');
		task.querySelector('.completed') !== null && task.classList.add('show-task');
	});
};

const getNumberOfWeeks = date => {
	const targetDate = new Date(date);
	const dayOfWeek = targetDate.getDay();
	const firstDayOfYear = new Date(targetDate.getFullYear(), 0, 1);
	let daysSinceStartOfYear = Math.floor((targetDate - firstDayOfYear) / 86400000);
	const firstDayOfYearWeekday = firstDayOfYear.getDay();
	const offset = firstDayOfYearWeekday > 1 ? 7 - firstDayOfYearWeekday : 0;
	daysSinceStartOfYear += offset;
	return Math.ceil((daysSinceStartOfYear + 1) / 7);
};

// ------------------------ invoking -------------------------- //

window.addEventListener('DOMContentLoaded', main);
