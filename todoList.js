document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.querySelector('#todo-list form');
    const newTodoInput = document.getElementById('new-todo');
    const taskListDiv = document.querySelector('.task-list');
    const completedSpan = document.querySelector('.completed');
    const uncompletedSpan = document.querySelector('.uncompleted');
    const addBtn = document.querySelector('.add-btn');
    const checkAll = document.getElementById('check-all');
    const deleteSelect = document.getElementById('delete-select');

    // --- 2. Khai báo biến trạng thái ---
    // Sử dụng một mảng để lưu trữ các task. Mỗi task là một đối tượng.
    let tasks = [];
    let taskIdCounter = 1; 

    // --- 3. Helper functions ---

    // Hàm lưu trữ tasks vào localStorage
    const saveTasksToLocalStorage = () => {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    };

    // Hàm tải tasks từ localStorage
    const loadTasksFromLocalStorage = () => {
        const storedTasks = localStorage.getItem('todoTasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            // Cập nhật taskIdCounter để tránh trùng lặp ID khi thêm task mới
            // Tìm ID lớn nhất hiện có và tăng lên 1
            if (tasks.length > 0) {
                taskIdCounter = Math.max(...tasks.map(task => task.id)) + 1;
            } else {
                taskIdCounter = 1;
            }
            // Render lại các task từ dữ liệu đã tải
            tasks.forEach(task => {
                const taskItem = createTaskItem(task.text, task.isCompleted, task.id); 
                taskListDiv.appendChild(taskItem);
            });
        }
    };

    // Hàm cập nhật số lượng task đã hoàn thành và chưa hoàn thành
    const updateTaskCounts = () => {
        const completedTasks = tasks.filter(task => task.isCompleted).length;
        const totalTasks = tasks.length;
        const uncompletedTasks = totalTasks - completedTasks;

        completedSpan.textContent = completedTasks;
        uncompletedSpan.textContent = uncompletedTasks;
    };

    // Hàm tạo một task item mới và gắn các sự kiện riêng của nó (xóa, sửa, checkbox)
    // Thêm tham số `id` để có thể tái tạo task với ID đã lưu
    const createTaskItem = (text, isCompleted = false, id = taskIdCounter) => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.dataset.id = id;

        taskItem.innerHTML = `
            <div class="left">
                <input type="checkbox" name="task" id="task-${taskItem.dataset.id}" ${isCompleted ? 'checked' : ''}>
                <label for="task-${taskItem.dataset.id}" ${isCompleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : ''}>${text}</label>
            </div>
            <div class="right">
                <button class="delete-btn">Delete</button>
                <button class="edit-btn">Edit</button>
            </div>
        `;

        // Gắn sự kiện cho checkbox (đánh dấu hoàn thành/chưa hoàn thành)
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (event) => {
            const label = taskItem.querySelector('label');
            if (event.target.checked) {
                label.style.textDecoration = 'line-through';
                label.style.opacity = '0.6';
            } else {
                label.style.textDecoration = 'none';
                label.style.opacity = '1';
            }
            // Cập nhật trạng thái isCompleted trong mảng tasks
            const taskId = parseInt(taskItem.dataset.id);
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].isCompleted = event.target.checked;
                saveTasksToLocalStorage(); 
            }
            updateTaskCounts();
        });

        // Gắn sự kiện cho nút xóa
        const deleteButton = taskItem.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            const taskId = parseInt(taskItem.dataset.id);
            tasks = tasks.filter(task => task.id !== taskId); 
            taskItem.remove();
            saveTasksToLocalStorage();
            updateTaskCounts();
        });

        // Gắn sự kiện cho nút sửa
        const editButton = taskItem.querySelector('.edit-btn');
        editButton.addEventListener('click', () => {
            const leftDiv = taskItem.querySelector('.left');
            const rightDiv = taskItem.querySelector('.right');
            const label = leftDiv.querySelector('label');
            const checkbox = leftDiv.querySelector('input[type="checkbox"]');
            const currentText = label.textContent;

            // Vô hiệu hóa input thêm task và nút Add khi đang sửa
            newTodoInput.disabled = true;
            addBtn.disabled = true;

            // Ẩn label và checkbox hiện tại
            label.style.display = 'none';
            checkbox.style.display = 'none';

            // Tạo input để sửa task
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = currentText;
            editInput.classList.add('edit-task-input');
            leftDiv.appendChild(editInput);
            editInput.focus();

            // Ẩn nút Edit và Delete hiện tại
            const deleteBtn = rightDiv.querySelector('.delete-btn');
            const editBtn = rightDiv.querySelector('.edit-btn');
            deleteBtn.style.display = 'none';
            editBtn.style.display = 'none';

            // Tạo nút Save
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.classList.add('save-btn');
            rightDiv.appendChild(saveButton);

            // Tạo nút Cancel
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add('cancel-btn');
            rightDiv.appendChild(cancelButton);


            // Hàm chung để kết thúc quá trình chỉnh sửa (lưu hoặc hủy)
            const finishEditing = () => {
                // Kích hoạt lại input thêm task và nút Add
                newTodoInput.disabled = false;
                addBtn.disabled = false;
                newTodoInput.focus();

                // Hiển thị lại label và checkbox
                label.style.display = '';
                checkbox.style.display = '';
                // Xóa input chỉnh sửa và các nút Save/Cancel
                editInput.remove();
                saveButton.remove();
                cancelButton.remove();
                // Hiển thị lại nút Edit và Delete ban đầu
                deleteBtn.style.display = '';
                editBtn.style.display = '';
            };

            // Hàm xử lý khi nhấn Save
            const saveEdit = () => {
                const newText = editInput.value.trim();
                if (newText !== '') {
                    label.textContent = newText; 
                    // Cập nhật nội dung trong mảng tasks
                    const taskId = parseInt(taskItem.dataset.id);
                    const taskIndex = tasks.findIndex(task => task.id === taskId);
                    if (taskIndex !== -1) {
                        tasks[taskIndex].text = newText;
                        saveTasksToLocalStorage();
                    }
                }
                finishEditing();
            };

            // Hàm xử lý khi nhấn Cancel
            const cancelEdit = () => {
                finishEditing();
            };

            // Lắng nghe sự kiện click cho nút Save
            saveButton.addEventListener('click', saveEdit);

            // Lắng nghe sự kiện click cho nút Cancel
            cancelButton.addEventListener('click', cancelEdit);

            // Cho phép nhấn Enter trong ô input chỉnh sửa để lưu
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit();
                }
            });
        });

        return taskItem;
    };

    // --- 4. Định nghĩa các trình xử lý sự kiện (event listeners) ---

    // Xử lý sự kiện khi submit form (thêm task mới)
    todoForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const taskText = newTodoInput.value.trim();

        if (taskText) { 
            const newTask = {
                id: taskIdCounter, 
                text: taskText,
                isCompleted: false
            };
            tasks.push(newTask); 
            saveTasksToLocalStorage(); 

            const newTaskItem = createTaskItem(newTask.text, newTask.isCompleted, newTask.id); 
            taskListDiv.appendChild(newTaskItem);
            taskIdCounter++; // Tăng ID cho task tiếp theo

            newTodoInput.value = ''; 
            updateTaskCounts(); 
        }
    });
    checkAll.addEventListener('change', () => {
        const isChecked = checkAll.checked;

        // Cập nhật trạng thái các task
        tasks = tasks.map(task => ({ ...task, isCompleted: isChecked }));

        // Lưu và cập nhật lại giao diện
        saveTasksToLocalStorage();

        // Xoá tất cả task hiện có trong DOM
        taskListDiv.innerHTML = '';

        // Vẽ lại toàn bộ task với trạng thái mới
        tasks.forEach(task => {
            const taskItem = createTaskItem(task.text, task.isCompleted, task.id);
            taskListDiv.appendChild(taskItem);
        });

        updateTaskCounts();
});
    // 5 Xử lý sự kiện khi nhấn check box và xóa
    deleteSelect.addEventListener('click', () => {
        // Lấy checkbox đang được check
        const completedCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]:checked');

        completedCheckboxes.forEach((checkbox) => {
            const taskItem = checkbox.closest('.task-item');
            const taskId = parseInt(taskItem.dataset.id);

            // Xóa task khỏi mảng tasks
            tasks = tasks.filter(task => task.id !== taskId);

            // Xóa khỏi DOM
            taskItem.remove();
        });

        saveTasksToLocalStorage();
        updateTaskCounts();
    });
    // --- 6. Khởi tạo ứng dụng --
    // Tải các task từ localStorage khi ứng dụng khởi động
    loadTasksFromLocalStorage();
    // Cập nhật số lượng task ban đầu (dựa trên dữ liệu đã tải)
    updateTaskCounts();
});