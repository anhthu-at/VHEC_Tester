({
    doInit: function (component, event, helper) {
        var recordId = component.get("v.recordId");
        // Gọi phương thức Apex để lấy thông tin chi tiết sinh viên
        var action = component.get("c.getStudentDetails");
        action.setParams({
            "studentID": recordId
        });

        // Xử lý kết quả trả về từ Apex
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                // Lấy thông tin sinh viên và lưu vào component
                var student = response.getReturnValue();
                component.set("v.student", student);
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.log("Error occurred: ", errors);
            }
        });

        // Gửi yêu cầu Apex
        $A.enqueueAction(action);
    },

    handleClose: function(component, event, helper) {
        var closeEvent = component.getEvent("closeModalEvent");
        if (closeEvent) {
            closeEvent.fire();
        }
    },
});
