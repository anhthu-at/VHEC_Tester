({
    searchStudents: function (component, event, helper) {
        var studentCode = component.get("v.studentCode");
        var fullName = component.get("v.fullName");
        var classCode = component.get("v.classCode");
        var startBirthDate = component.get("v.startBirthDate");
        var endBirthDate = component.get("v.endBirthDate");
        var gender = component.get("v.selectedValueGender");

        var action = component.get("c.searchStudentByCriteria");

        action.setParams({
            studentCode: studentCode,
            fullName: fullName,
            classCode: classCode,
            startBirthDate: startBirthDate,
            endBirthDate: endBirthDate,
            gender: gender
        });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var students = response.getReturnValue();
                component.set("v.allStudents", students);
                console.log("All Students:", students);

                // Giới hạn số lượng sinh viên hiển thị (5 sinh viên đầu tiên)
                var pageSize = component.get("v.pageSize");
                var limitedStudents = students.slice(0, pageSize);  // Giới hạn 5 sinh viên
                component.set("v.students", limitedStudents);

                // Tính tổng số trang (giới hạn trang ở 5 sinh viên mỗi trang)
                var totalPages = Math.ceil(students.length / pageSize);
                component.set("v.totalPages", totalPages);
                component.set("v.currentPage", 1);
                console.log("totalPages Students:", totalPages);

                // Cập nhật danh sách trang
                this.updatePageList(component);

                // create table from js .
                component.set("v.columns", [
                    { label: 'Mã Sinh viên', fieldName: 'StudentCode__c' },
                    { label: 'Tên', fieldName: 'Name' },
                    { label: 'Ngày sinh', fieldName: 'Birthday__c', type: 'date' },
                    { label: 'Giới tính', fieldName: 'Gender__c' },
                    { label: 'Trạng thái học tập', fieldName: 'LearningStatus__c' },
                    { label: 'Mã lớp', fieldName: 'Class_look__r.Name' },
                    {
                        label: 'Hành động',
                        type: 'button',
                        typeAttributes: {
                            label: 'Detail',
                            iconName: 'utility:preview',
                            name: 'detail',
                            variant: 'base',
                            title: "Detail",
                            class: "slds-button slds-button_compact"

                        }
                    },
                    {
                        label: 'Hành động',
                        type: 'button',
                        typeAttributes: {
                            label: 'Update',
                            iconName: 'utility:edit',
                            name: 'update',
                            variant: 'base',
                            title: "Update",
                            class: "slds-button slds-button_compact"

                        }
                    },
                    {
                        label: 'Hành động',
                        type: 'button',
                        typeAttributes: {
                            label: 'Delete',
                            iconName: 'utility:delete',
                            name: 'delete',
                            variant: 'base',
                            title: "Delete",
                            class: "slds-button slds-button_compact"

                        }
                    }
                ]);
            } else {
                console.log("Error: " + response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    handleInputChange: function (component, event) {
        component.set("v.isClearDisabled", !hasData);
    },

    clearForm: function (component, event) {
        // Xóa dữ liệu form
        component.set("v.studentCode", "");
        component.set("v.fullName", "");
        component.set("v.classCode", "");
        component.set("v.startBirthDate", null);
        component.set("v.endBirthDate", null);
        component.set("v.gender", "");

        // Cập nhật trạng thái nút Clear
        component.set("v.isClearDisabled", true);
    },

    navigateToCreate: function (component, event, helper) {
        // Thay URL bên dưới bằng URL của trang "Create"
        const createPageUrl = "/lightning/n/CMP_CreateStudent";
        window.location.href = createPageUrl;
    },

    getDataPickList: function (component, event, helper) {
        // Lấy picklist cho Gender
        let actionGender = component.get("c.getPicklistValues");
        actionGender.setParams({
            objectName: component.get("v.targetObjectNameGender"),
            fieldName: component.get("v.targetFieldNameGender")
        });

        actionGender.setCallback(this, function (response) {
            let state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.picklistOptionsGender", response.getReturnValue());
            } else {
                console.error("Error fetching Gender picklist values: " + response.getError());
            }
        });
        $A.enqueueAction(actionGender);

        // Lấy picklist cho Status
        let actionStatus = component.get("c.getPicklistValues");
        actionStatus.setParams({
            objectName: component.get("v.targetObjectNameStatus"),
            fieldName: component.get("v.targetFieldNameStatus")
        });

        actionStatus.setCallback(this, function (response) {
            let state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.picklistOptionsStatus", response.getReturnValue());
            } else {
                console.error("Error fetching Status picklist values: " + response.getError());
            }
        });
        $A.enqueueAction(actionStatus);
    },

    openDeleteModal: function (component, event, helper) {
        var studentId = event.getSource().get("v.value");

        var selectedStudentIds = component.get("v.selectedStudents");

        // If there's a studentId from the button, include it in the list
        if (studentId && !selectedStudentIds.includes(studentId)) {
            selectedStudentIds.push(studentId);  // Add studentId if not already selected
        }

        // Update studentToDelete with the selected student IDs
        if (selectedStudentIds.length > 0) {
            component.set("v.studentToDelete", selectedStudentIds.join(', '));  // Join student IDs as a string
        } else {
            component.set("v.studentToDelete", "No students selected.");
        }

        // Open the modal
        component.set("v.isDeleteModalOpen", true);
    },


    closeDeleteModal: function (component, event, helper) {
        component.set("v.isDeleteModalOpen", false);
    },

    closeDetailModal: function (component, event, helper) {
        component.set("v.isDetailModalOpen", false); // Close the modal
    },

    openCreateModal: function (component, event, helper) {
        component.set("v.isCreateModalOpen", true);
    },

    closeCreateModal: function (component, event, helper) {
        component.set("v.isCreateModalOpen", false);
    },


    openDetailModal: function (component, event, helper) {
        var studentId = event.getSource().get("v.value");

        component.set("v.selectedStudentId", studentId);
        component.set("v.isDetailModalOpen", true);

    },

    openUpdateModal: function (component, event, helper) {
        var studentId = event.getSource().get("v.value");

        component.set("v.selectedStudentId", studentId);
        component.set("v.isUpdateModalOpen", true);

    },

    closeUpdateModal: function (component, event, helper) {
        component.set("v.isUpdateModalOpen", false);
    },


    getPicklistForSearch: function (component, event, helper) {
        let action = component.get("c.getPicklistValues");
        action.setParams({
            objectName: "Student__c",
            fieldName: "Status__c"
        });

        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.picklistOptionsStatus", response.getReturnValue());
            } else {
                console.error("Error fetching picklist: " + response.getError());
            }
        });

        $A.enqueueAction(action);
    },

    loadClassOptions: function (component, event, helper) {
        var action = component.get("c.getClassOptions");

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var classOptions = response.getReturnValue();
                console.log("Class options returned:", classOptions); // Debugging the response

                // Set the options to the attribute for binding to the lightning:select
                component.set("v.classOptions", classOptions);
            } else {
                console.error("Error loading class options:", response.getError());
            }
        });

        $A.enqueueAction(action);
    },

    clickDetailStudent: function (component, event, helper) {
        var studentId = event.getSource().get("v.value");
        console.log('student id ', studentId);

        var action = component.get("c.getStudentIds");
        action.setParams({ studentId: studentId });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var studentDetails = response.getReturnValue();
                // input data from apex
                component.set("v.studentToDetail", studentDetails.Id);
                component.set("v.studentFirstNameDetails", studentDetails.Firstname__c);
                component.set("v.studentLastNameDetails", studentDetails.Lastname__c);
                component.set("v.studentBirthdayDetails", studentDetails.Birthday__c);
                component.set("v.studentGenderDetails", studentDetails.Gender__c);
                component.set("v.studentClassDetails", studentDetails.Class_look__r.Name);
                component.set("v.studentStatusDetails", studentDetails.LearningStatus__c);

                component.set("v.isDetailModalOpen", true);
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.log("Error:", errors);
            }
        });

        // Gọi Apex
        $A.enqueueAction(action);
    },


    selectAllStudents: function (component, event, helper) {
        var isChecked = event.getSource().get("v.checked");  // Lấy trạng thái của checkbox "Select All"
        var students = component.get("v.students");

        // Cập nhật trạng thái 'isSelected' của tất cả sinh viên
        students.forEach(student => {
            student.isSelected = isChecked;
        });

        component.set("v.students", students);

        // get id student user tick
        var selectedStudentIds = students.filter(student => student.isSelected).map(student => student.Id);

        // update selectedStudents
        component.set("v.selectedStudents", selectedStudentIds);  // Lưu danh sách ID sinh viên đã chọn

        // update studentToDelete ID studetn -> string
        component.set("v.studentToDelete", selectedStudentIds.join(', '));
        // update number select
        component.set("v.selectedCount", selectedStudentIds.length);
    },


    handleStudentSelection: function (component, event, helper) {
        // get id student
        var studentId = event.getSource().get("v.value");
        // get status checkbox (checked or unchecked)
        var isChecked = event.getSource().get("v.checked");

        var students = component.get("v.students");   // Lấy danh sách sinh viên

        // Tìm sinh viên và cập nhật trạng thái 'isSelected'
        for (var i = 0; i < students.length; i++) {
            if (students[i].Id === studentId) {
                students[i].isSelected = isChecked;
                break;
            }
        }

        // Cập nhật lại dữ liệu sinh viên vào component
        component.set("v.students", students);

        // Lọc danh sách sinh viên đã chọn
        var selectedStudents = students.filter(function (student) {
            return student.isSelected;
        });

        // Cập nhật lại selectedStudents trong component
        component.set("v.selectedStudents", selectedStudents);

        // Đếm số lượng sinh viên được chọn và cập nhật lại số lượng
        component.set("v.selectedCount", selectedStudents.length);
    },


    deleteSelectedStudent: function (component, event, helper) {
        var studentId = component.get("v.studentToDelete");

        var studentIds = [studentId];
        // Perform the deletion logic here (e.g., call an Apex method to delete the student)
        var action = component.get("c.deleteStudentRecords");
        action.setParams({ studentIds: studentIds });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {

                component.set("v.isDeleteModalOpen", false);

            } else {

                console.log("There was an issue deleting the student.");
            }
        });

        $A.enqueueAction(action);
    },


    confirmDelete: function (component, event) {
        // get id for many student
        let studentIds = component.get("v.studentToDelete");

        // tranfer string -> array
        if (typeof studentIds === "string") {
            studentIds = studentIds.split(",").map(id => id.trim());
        }

        // console.log('student id:', studentIds);

        if ((!studentIds || studentIds.length === 0)) {
            // console.log("Select at least 1 student to delete!");
            return;
        }

        let action = component.get("c.deleteStudentRecords");
        action.setParams({ studentIds: studentIds });

        action.setCallback(this, function (response) {
            let state = response.getState();
            console.log('state ', state);
            if (state === "SUCCESS") {
                console.log("success!");
                component.set("v.selectedStudents", []);
                component.set("v.listStudentIds", []);
                component.set("v.isDeleteModalOpen", false);
                let cmpEvent = component.getEvent("CMP_Reload");
                // console.log('event here ',cmpEvent);
                if (cmpEvent) {
                    cmpEvent.fire();
                } else {
                    console.error("CMP_Reload event not found.");
                }
            } else if (state === "ERROR") {
                let errors = response.getError();
                console.error("error: ", JSON.stringify(errors));
                console.log("error.");
            }
        });

        $A.enqueueAction(action);
    },

    reloadData: function (component, event, helper) {
        console.log("CMP_Reload event fired. Reloading data...");
        helper.getStudents(component);
    },


    closeDeleteModal: function (component, event, helper) {
        component.set("v.isDeleteModalOpen", false);
    },

    // next Page for search result
    updatePaginatedStudents: function (component) {
        var allStudents = component.get("v.allStudents");  // Lấy toàn bộ kết quả tìm kiếm
        var pageSize = component.get("v.pageSize");
        var currentPage = component.get("v.currentPage");

        // Tính toán các chỉ số bắt đầu và kết thúc cho trang hiện tại
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = startIndex + pageSize;
        var paginatedStudents = allStudents.slice(startIndex, endIndex);

        console.log("Displaying students on page", currentPage, ":", paginatedStudents);
        component.set("v.students", paginatedStudents);  // Hiển thị sinh viên cho trang hiện tại

        // Cập nhật trạng thái nút Next/Previous
        var totalPages = Math.ceil(allStudents.length / pageSize);
        component.set("v.disableNext", currentPage >= totalPages);
        component.set("v.disablePrev", currentPage <= 1);

        // Cập nhật danh sách các trang hiển thị
        this.updatePageList(component, currentPage, totalPages);
    },

    nextPage: function (component, event) {
        let currentPage = component.get("v.currentPage");
        let allStudents = component.get("v.allStudents");  // Lấy danh sách đầy đủ từ allStudents
        let pageSize = component.get("v.pageSize");

        if (!allStudents || allStudents.length === 0) {
            console.log("Không có dữ liệu để phân trang");
            return; // Không thực hiện phân trang nếu không có kết quả
        }

        let totalPages = Math.ceil(allStudents.length / pageSize);
        console.log("Next Page -> Current: " + currentPage + ", Total Pages: " + totalPages);

        // Nếu trang hiện tại còn trang tiếp theo
        if (currentPage < totalPages) {
            let newPage = currentPage + 1;
            component.set("v.currentPage", newPage);

            // Tính toán các chỉ số bắt đầu và kết thúc của trang hiện tại
            let startIndex = (newPage - 1) * pageSize;
            let endIndex = startIndex + pageSize;
            let paginatedStudents = allStudents.slice(startIndex, endIndex); // Cắt danh sách sinh viên theo trang

            console.log("Displaying students:" + newPage, paginatedStudents);
            component.set("v.students", paginatedStudents);

            // Cập nhật chỉ số hiển thị dạng "x/y"
            let displayedRange = `${endIndex} / ${allStudents.length}`;
            component.set("v.displayedRange", displayedRange);

            // Cập nhật trạng thái nút Next/Previous
            component.set("v.disableNext", newPage >= totalPages);
            component.set("v.disablePrev", newPage <= 1);

            // Cập nhật danh sách các trang hiển thị (±2 trang xung quanh trang hiện tại)
            let startPage = Math.max(1, newPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);
            let pages = [];
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            component.set("v.pageList", pages);

        }
    },


    prevPage: function (component, event) {
        let currentPage = component.get("v.currentPage");

        if (currentPage > 1) {
            let newPage = currentPage - 1;
            component.set("v.currentPage", newPage);

            // Cập nhật lại danh sách sinh viên cho trang trước
            let allStudents = component.get("v.allStudents") || [];
            let pageSize = component.get("v.pageSize");
            let startIndex = (newPage - 1) * pageSize;
            let endIndex = startIndex + pageSize;
            let paginatedStudents = allStudents.slice(startIndex, endIndex);

            component.set("v.students", paginatedStudents);

            // Cập nhật trạng thái của nút Next/Prev
            component.set("v.disableNext", newPage * pageSize >= allStudents.length);
            component.set("v.disablePrev", newPage === 1);

            // Cập nhật danh sách các trang hiển thị (±2 trang xung quanh trang hiện tại)
            let totalPages = Math.ceil(allStudents.length / pageSize);
            let pages = [];
            let startPage = Math.max(1, newPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            component.set("v.pageList", pages);

            // Cập nhật khoảng hiển thị theo định dạng "5/35"
            let currentRecordCount = paginatedStudents.length;
            let displayedRange = `${Math.min(startIndex + currentRecordCount, allStudents.length)} / ${allStudents.length}`;
            component.set("v.displayedRange", displayedRange);
        }
    },


    updatePagination: function (component) {
        let currentPage = component.get("v.currentPage");
        let totalStudents = component.get("v.allStudents").length;
        let pageSize = component.get("v.pageSize");
        let totalPages = Math.ceil(totalStudents / pageSize);

        // Tính toán các trang hiển thị (±2 trang xung quanh trang hiện tại)
        let pages = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Cập nhật danh sách các trang và trạng thái các nút phân trang
        component.set("v.pageList", pages);
        component.set("v.disablePrev", currentPage === 1);
        component.set("v.disableNext", currentPage === totalPages);
    },

    changePage: function (component, event) {
        let selectedPage = parseInt(event.getSource().get("v.label"), 10);
        let allStudents = component.get("v.allStudents");
        let pageSize = component.get("v.pageSize");

        // console.log("Changing to page: ", selectedPage);
        // Kiểm tra tổng số trang
        let totalPages = Math.ceil(allStudents.length / pageSize);
        if (selectedPage < 1 || selectedPage > totalPages) return;

        // Cập nhật trang hiện tại
        component.set("v.currentPage", selectedPage);

        // Cắt danh sách sinh viên cho trang mới
        let startIndex = (selectedPage - 1) * pageSize;
        let endIndex = startIndex + pageSize;
        let paginatedStudents = allStudents.slice(startIndex, endIndex);

        // Cập nhật danh sách sinh viên hiển thị
        component.set("v.students", paginatedStudents);

        // Cập nhật trạng thái của nút Next/Prev
        component.set("v.disableNext", selectedPage >= totalPages);
        component.set("v.disablePrev", selectedPage === 1);

        // Cập nhật danh sách các trang hiển thị (±2 trang xung quanh trang hiện tại)
        let pages = [];
        let startPage = Math.max(1, selectedPage - 2); // Tính trang bắt đầu
        let endPage = Math.min(totalPages, startPage + 4); // Tính trang kết thúc (tổng cộng 5 trang)

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        component.set("v.pageList", pages);
        // Update the displayed range for the records (current record / total records)
        let currentRecordCount = paginatedStudents.length;
        component.set("v.currentStudentCount", currentRecordCount);

        // Display the range in the format: "5/35"
        let displayedRange = `${Math.min(startIndex + currentRecordCount, allStudents.length)} / ${allStudents.length}`;
        component.set("v.displayedRange", displayedRange);

    },

    firstPage: function (component, event, helper) {
        // set first page =1
        component.set("v.currentPage", 1);
        // Cập nhật lại danh sách sinh viên cho trang đầu tiên
        let allStudents = component.get("v.allStudents") || [];
        let pageSize = component.get("v.pageSize");
        let startIndex = 0;
        let endIndex = startIndex + pageSize;
        let paginatedStudents = allStudents.slice(startIndex, endIndex);

        console.log("Displaying students: ", paginatedStudents);
        component.set("v.students", paginatedStudents);

        // Kiểm tra trạng thái nút Next/Previous
        component.set("v.disableNext", pageSize >= allStudents.length);
        component.set("v.disablePrev", true);

        // Cập nhật danh sách các trang (±2 trang xung quanh trang hiện tại)
        let totalPages = Math.ceil(allStudents.length / pageSize);
        let pages = [];
        for (let i = 1; i <= Math.min(5, totalPages); i++) {
            pages.push(i);
        }
        component.set("v.pageList", pages);

        // Update the displayed range (current record / total records)
        let currentRecordCount = paginatedStudents.length;
        component.set("v.currentStudentCount", currentRecordCount);

        // Update the displayed range in the format: "5/35"
        let displayedRange = `${currentRecordCount} / ${allStudents.length}`;
        component.set("v.displayedRange", displayedRange);
    },

    lastPage: function (component, event, helper) {
        // Đặt trang hiện tại là trang cuối cùng
        let totalStudents = component.get("v.allStudents").length;
        let pageSize = component.get("v.pageSize");
        let totalPages = Math.ceil(totalStudents / pageSize);

        component.set("v.currentPage", totalPages);

        // Cập nhật lại danh sách sinh viên cho trang cuối cùng
        let allStudents = component.get("v.allStudents") || [];
        let startIndex = (totalPages - 1) * pageSize;
        let endIndex = startIndex + pageSize;
        let paginatedStudents = allStudents.slice(startIndex, endIndex);

        console.log("Displaying students: ", paginatedStudents);
        component.set("v.students", paginatedStudents);

        // Kiểm tra trạng thái nút Next/Previous
        component.set("v.disableNext", true);
        component.set("v.disablePrev", totalPages === 1);

        // Cập nhật danh sách các trang (±2 trang xung quanh trang hiện tại)
        let pages = [];
        let startPage = Math.max(1, totalPages - 4); // Tính trang bắt đầu
        let endPage = Math.min(totalPages, startPage + 4); // Tính trang kết thúc (tổng cộng 5 trang)

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        component.set("v.pageList", pages);


        // Update the displayed range in the format: "5/35"
        let displayedRange = `${totalStudents} / ${totalStudents}`;
        component.set("v.displayedRange", displayedRange);


    },

    updateStudentList: function (component) {
        // Lấy trang hiện tại và kích thước mỗi trang
        let currentPage = component.get("v.currentPage");
        let pageSize = component.get("v.pageSize");

        // Lấy danh sách tất cả sinh viên
        let allStudents = component.get("v.allStudents") || [];

        // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = startIndex + pageSize;

        // Cắt danh sách sinh viên theo trang hiện tại
        let paginatedStudents = allStudents.slice(startIndex, endIndex);

        // Cập nhật danh sách sinh viên cho trang hiện tại
        component.set("v.students", paginatedStudents);

        // Kiểm tra nếu đã đến trang cuối cùng, và cập nhật trạng thái các nút phân trang
        this.updatePagination(component);
    },

    updatePageList: function (component) {
        let currentPage = component.get("v.currentPage");
        let totalPages = component.get("v.totalPages");  // Lấy totalPages đã được tính từ hàm searchStudents

        // Tính toán các trang hiển thị (±2 trang xung quanh trang hiện tại)
        let pages = [];
        let startPage = Math.max(1, currentPage - 3);  // Tính toán trang bắt đầu
        let endPage = Math.min(totalPages, currentPage + 3);  // Tính toán trang kết thúc

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);  // Thêm các trang vào mảng
        }


        component.set("v.pageList", pages);
        component.set("v.disablePrev", currentPage === 1);
        component.set("v.disableNext", currentPage === totalPages); // Cập nhật danh sách trang
    },

    doInit: function (component, event, helper) {
        var action = component.get("c.getStudents");

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                const students = response.getReturnValue();
                // console.log("Fetched students: ", students);

                for (var i = 0; i < students.length; i++) {
                    var birthday = students[i].Birthday__c;  // Lấy giá trị ngày sinh
                    if (birthday) {
                        students[i].Birthday__c = helper.formatDate(birthday);  // Áp dụng định dạng ngày
                    }
                }
                // Set danh sách tất cả sinh viên
                component.set("v.allStudents", students);
                component.set("v.pageSize", 5);
                component.set("v.currentPage", 1);

                // Tổng số sinh viên
                const totalStudents = students.length;
                component.set("v.totalStudents", totalStudents);

                // Cập nhật danh sách sinh viên cho trang đầu tiên
                let allStudents = component.get("v.allStudents") || [];
                let pageSize = component.get("v.pageSize");
                let startIndex = 0;
                let endIndex = startIndex + pageSize;
                let paginatedStudents = allStudents.slice(startIndex, endIndex);

                console.log("Displaying students: ", paginatedStudents);
                component.set("v.students", paginatedStudents);

                // Kiểm tra trạng thái nút Next/Previous
                component.set("v.disableNext", pageSize >= allStudents.length);
                component.set("v.disablePrev", true);

                // Cập nhật danh sách các trang (±2 trang xung quanh trang hiện tại)
                let totalPages = Math.ceil(allStudents.length / pageSize);
                let pages = [];
                for (let i = 1; i <= Math.min(5, totalPages); i++) {
                    pages.push(i);
                }
                component.set("v.pageList", pages);

                // Update số lượng sinh viên hiển thị trên trang đầu tiên
                let currentRecordCount = paginatedStudents.length;
                component.set("v.currentStudentCount", currentRecordCount);

                // Hiển thị số lượng sinh viên theo format "5 / 35"
                let displayedRange = `${currentRecordCount} / ${allStudents.length}`;
                component.set("v.displayedRange", displayedRange);

                // Gọi hàm cập nhật danh sách trang
                this.updatePageList(component);
            } else {
                console.log("Error: " + response.getError());
            }
        });

        $A.enqueueAction(action);
    },

    // doInit: function (component, event, helper) {
    //     var action = component.get("c.getRecordsPerPage");  // Gọi Apex để lấy số lượng trang từ Custom Setting
    //     console.log('Fetching number of pages...');  // Log kiểm tra
    //     action.setCallback(this, function (response) {
    //         var state = response.getState();
    //         if (state === "SUCCESS") {
    //             var pageSize = response.getReturnValue(); // Lấy số lượng trang từ Apex
    //             console.log('Page size from Apex: ', pageSize);  // Kiểm tra giá trị nhận được
    //             component.set("v.pageSize", pageSize); // Cập nhật số lượng bản ghi trên mỗi trang
    //             console.log('number page: ', pageSize);
    //             // Gọi lại API lấy danh sách sinh viên
    //             var studentsAction = component.get("c.getStudents");
    //             studentsAction.setCallback(this, function (response) {
    //                 var state = response.getState();
    //                 if (state === "SUCCESS") {
    //                     const students = response.getReturnValue();

    //                     // Xử lý ngày sinh cho sinh viên
    //                     for (var i = 0; i < students.length; i++) {
    //                         var birthday = students[i].Birthday__c;
    //                         if (birthday) {
    //                             students[i].Birthday__c = helper.formatDate(birthday); // Định dạng ngày
    //                         }
    //                     }

    //                     // Lưu danh sách sinh viên vào component
    //                     component.set("v.allStudents", students);

    //                     // Tổng số sinh viên
    //                     const totalStudents = students.length;
    //                     component.set("v.totalStudents", totalStudents);

    //                     // Cập nhật danh sách sinh viên cho trang đầu tiên
    //                     let allStudents = component.get("v.allStudents") || [];
    //                     let startIndex = 0;
    //                     let endIndex = startIndex + pageSize;
    //                     let paginatedStudents = allStudents.slice(startIndex, endIndex);

    //                     component.set("v.students", paginatedStudents);

    //                     // Kiểm tra trạng thái nút Next/Previous
    //                     component.set("v.disableNext", pageSize >= allStudents.length);
    //                     component.set("v.disablePrev", true);

    //                     // Cập nhật danh sách các trang
    //                     let totalPages = Math.ceil(allStudents.length / pageSize);
    //                     let pages = [];
    //                     for (let i = 1; i <= totalPages; i++) {
    //                         pages.push(i);
    //                     }
    //                     component.set("v.pageList", pages);

    //                     // Hiển thị số lượng sinh viên trên trang đầu tiên
    //                     let currentRecordCount = paginatedStudents.length;
    //                     component.set("v.currentStudentCount", currentRecordCount);

    //                     // Hiển thị số lượng sinh viên theo format "5 / 35"
    //                     let displayedRange = `${currentRecordCount} / ${allStudents.length}`;
    //                     component.set("v.displayedRange", displayedRange);

    //                     // Cập nhật danh sách trang
    //                     this.updatePageList(component);
    //                 }
    //             });
    //             $A.enqueueAction(studentsAction);
    //         } else {
    //             console.log("Error: " + response.getError());
    //         }
    //     });
    //     $A.enqueueAction(action);
    // },

    updateNumberPage: function (component, event, helper) {
        // Gọi phương thức Apex để lấy số trang
        var action = component.get("c.getRecordsPerPage");

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var pageSize = response.getReturnValue(); // Số bản ghi trên mỗi trang từ Apex
                console.log('Page size from Apex in updateNumberPage: ', pageSize);  // Kiểm tra giá trị nhận được
                component.set("v.pageSize", pageSize);

                // Lấy tất cả sinh viên để cập nhật cho các trang mới
                var students = component.get("v.allStudents");
                let startIndex = (component.get("v.currentPage") - 1) * pageSize;
                let endIndex = startIndex + pageSize;
                let paginatedStudents = students.slice(startIndex, endIndex);

                // Cập nhật danh sách sinh viên của trang hiện tại
                component.set("v.students", paginatedStudents);

                // Cập nhật số lượng sinh viên hiển thị
                component.set("v.currentStudentCount", paginatedStudents.length);
                let displayedRange = `${paginatedStudents.length} / ${students.length}`;
                component.set("v.displayedRange", displayedRange);
            } else {
                console.log("Error: " + response.getError());
            }
        });
        $A.enqueueAction(action);
    },

});
