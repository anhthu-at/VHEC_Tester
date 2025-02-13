({
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

    doInit: function (component, event, helper) {
        // Lấy recordId từ component (trang tìm kiếm sẽ truyền vào)
        var recordId = component.get("v.recordId");
        console.log('recordId:', recordId);

        var action = component.get("c.getStudentDetails"); // Gọi phương thức Apex

        // Truyền recordId cho Apex
        action.setParams({
            "studentID": recordId
        });

        // Thiết lập callback khi phương thức Apex trả về
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var student = response.getReturnValue();
                // console.log('Student data:', student);// Lấy thông tin sinh viên trả về từ Apex
                if (student) {
                    // Cập nhật thông tin sinh viên vào component
                    component.set("v.student", student);
                    component.set("v.hasStudent", true); // Đặt hasStudent = true để hiển thị thông tin
                } else {
                    console.log("Không tìm thấy sinh viên với mã ID này.");
                    component.set("v.hasStudent", false);
                }
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error("Lỗi xảy ra: ", errors);
                component.set("v.hasStudent", false);
            }
        });

        // Gửi yêu cầu lên Apex
        $A.enqueueAction(action);
    },

    updateStudents: function (component, event, helper) {
        let student = component.get("v.student"); // Lấy danh sách sinh viên

        // console.log("student", student);

        if (!student || student.length === 0) {
            console.error("Danh sách sinh viên rỗng hoặc không hợp lệ.");
            return;
        }

        let action = component.get("c.updateStudentDetails"); // Gọi Apex method
        action.setParams({ student: student });
        action.setCallback(this, function (response) {

            let state = response.getState();
            console.log("state", state);
            if (state === "SUCCESS") {
                // Display success toast
                $A.get("e.force:showToast").setParams({
                    title: "Cập nhật thành công",
                    message: "Thông tin sinh viên đã được cập nhật.",
                    type: "success"
                }).fire();

                let searchEvent = $A.get("e.c:SearchEvent"); // Assuming you have a custom event for search
                searchEvent.fire(); // This will trigger the event and reload the search results

            } else if (state === "ERROR") {
                let errors = response.getError();
                console.error("Lỗi khi cập nhật sinh viên:", errors);

                // Display error toast
                $A.get("e.force:showToast").setParams({
                    title: "Lỗi cập nhật",
                    message: "Có lỗi xảy ra khi cập nhật thông tin sinh viên. Xem console để biết thêm chi tiết.",
                    type: "error"
                }).fire();
            }
        });

        $A.enqueueAction(action);
    },


    fetchGenderOptions: function (component, event, helper) {
        // Call Apex method to fetch gender options
        var action = component.get("c.getGenderOptions");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                // Populate gender options from Apex response
                component.set("v.genderOptions", response.getReturnValue());
            } else {
                console.error("Failed to fetch gender options: ", response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    loadClassOptions: function (component, event, helper) {
        var action = component.get("c.getClassOptions");

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var classData = response.getReturnValue();

                console.log("Class options returned:", classData); // Debugging the response

                // Chuyển đổi dữ liệu trả về thành định dạng phù hợp cho combobox
                var classOptions = classData.map(function (cls) {
                    return { label: cls.Name, value: cls.Id };
                });

                // Đặt danh sách class vào attribute để combobox sử dụng
                component.set("v.classOptions", classOptions);
            } else {
                console.error("Error loading class options:", response.getError());
            }
        });

        $A.enqueueAction(action);
    },



    fetchLearningStatusOptions: function (component, event, helper) {
        // Call Apex method to fetch gender options
        var action = component.get("c.getLearningStatusOptions");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                // Populate LearningStatus options from Apex response
                component.set("v.LearningStatusOptions", response.getReturnValue());
            } else {
                console.error("Failed to fetch LearningStatus options: ", response.getError());
            }
        });
        $A.enqueueAction(action);
    },


})
