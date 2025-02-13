({
    formatDate: function (date) {
        // Chuyển đổi ngày thành kiểu đối tượng Date
        var d = new Date(date);

        // Lấy ngày, tháng, năm
        var day = ("0" + d.getDate()).slice(-2);
        var month = ("0" + (d.getMonth() + 1)).slice(-2); // Tháng bắt đầu từ 0
        var year = d.getFullYear();

        // Trả về ngày theo định dạng dd-mm-yyyy
        return day + "-" + month + "-" + year;
    },
    getStudents: function (component) {
        let action = component.get("c.getStudents"); // Gọi Apex method getStudentList

        action.setCallback(this, function (response) {
            let state = response.getState();
            if (state === "SUCCESS") {
                const students = response.getReturnValue();

                // Định dạng ngày sinh
                for (var i = 0; i < students.length; i++) {
                    var birthday = students[i].Birthday__c;
                    if (birthday) {
                        students[i].Birthday__c = this.formatDate(birthday);
                    }
                }

                // Set danh sách tất cả sinh viên
                component.set("v.allStudents", students);
                component.set("v.pageSize", 5);
                component.set("v.currentPage", 1);

                // Tổng số sinh viên
                const totalStudents = students.length;
                component.set("v.totalStudents", totalStudents);

                // Cập nhật danh sách sinh viên hiển thị cho trang đầu tiên
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

                // Cập nhật danh sách các trang
                let totalPages = Math.ceil(allStudents.length / pageSize);
                let pages = [];
                for (let i = 1; i <= Math.min(5, totalPages); i++) {
                    pages.push(i);
                }
                component.set("v.pageList", pages);

                // Cập nhật số lượng sinh viên hiển thị
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

})
