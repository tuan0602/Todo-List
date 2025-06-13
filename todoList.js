document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.querySelector('#todo-list form');
    const newTodoInput = document.getElementById('new-todo');
    const taskListDiv = document.querySelector('.task-list');
    const completedSpan = document.querySelector('.completed');
    const uncompletedSpan = document.querySelector('.uncompleted');
    const addBtn = document.querySelector('.add-btn');
    let taskIdCounter = 1;

// Hàm cập nhật số lượng task đã hoàn thành và chưa hoàn thành
    const updateTaskCounts = () => {
        const completedTasks = taskListDiv.querySelectorAll('.task-item input[type="checkbox"]:checked').length;
        const totalTasks = taskListDiv.querySelectorAll('.task-item').length;
        const uncompletedTasks = totalTasks - completedTasks;

        completedSpan.textContent = completedTasks;
        uncompletedSpan.textContent = uncompletedTasks;
    };

// Hàm tạo một task item mới và gắn các sự kiện riêng của nó (xóa, sửa, checkbox)
    const createTaskItem = (text, isCompleted = false) => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.dataset.id = taskIdCounter++; // Gán một ID cho mỗi task

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
            updateTaskCounts();
        });

        // Gắn sự kiện cho nút xóa
        const deleteButton = taskItem.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            taskItem.remove();
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
                if (newText !== '') { // Chỉ cập nhật nếu có nội dung mới không rỗng
                    label.textContent = newText;
                }
                finishEditing(); // Kết thúc chỉnh sửa
            };

            // Hàm xử lý khi nhấn Cancel
            const cancelEdit = () => {
                // Không cập nhật label.textContent, chỉ khôi phục trạng thái
                finishEditing(); // Kết thúc chỉnh sửa
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

    // Xử lý sự kiện khi submit form (chỉ khi nhấn nút Add hoặc Enter trong ô input thêm task)
    todoForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const taskText = newTodoInput.value.trim();

        if (taskText) {
            const newTaskItem = createTaskItem(taskText);
            taskListDiv.appendChild(newTaskItem);
            newTodoInput.value = '';
            updateTaskCounts();
        }
    });

    updateTaskCounts();
});