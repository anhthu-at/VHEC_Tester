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



    insertStudent: function (component, event, helper) {
        var action = component.get("c.insertStudentValue");

        // Lấy giá trị từ form
        var firstName = component.get("v.Firstname__c");
        var lastName = component.get("v.Lastname__c");
        var birthday = component.get("v.Birthday__c");
        var gender = component.get("v.student.Gender__c");
        var classId = component.get("v.student.Class_look__c");
        var learningStatusId = component.get("v.student.LearningStatus__c");

        // console.log("Dữ liệu nhập vào:", firstName, lastName, birthday, gender, classId, learningStatusId);

        // Kiểm tra nếu có trường nào bị thiếu
        if (!firstName || !lastName || !birthday || !gender || !classId || !learningStatusId) {
            component.set("v.message", "Vui lòng điền đầy đủ thông tin.");

            var notificationLibrary = component.find("notifLib");
            if (notificationLibrary) {
                notificationLibrary.showToast({
                    "title": "Cảnh báo!",
                    "message": "Vui lòng điền đầy đủ thông tin.",
                    "variant": "warning"
                });
            }
            return;
        }

        // Tính toán tuổi
        var birthDate = new Date(birthday);
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // console.log("Tuổi tính toán:", age);

        // Kiểm tra tuổi có nhỏ hơn 18 không
        if (age < 18) {
            component.set("v.message", "Học sinh phải trên 18 tuổi.");

            var notificationLibrary = component.find("notifLib");
            if (notificationLibrary) {
                notificationLibrary.showToast({
                    "title": "Lỗi!",
                    "message": "Học sinh phải trên 18 tuổi.",
                    "variant": "error"
                });
            }
            return;
        }

        // Gửi dữ liệu đến Apex
        action.setParams({
            'firstName': firstName,
            'lastName': lastName,
            'birthday': birthday,
            'gender': gender,
            'classId': classId,
            'learningStatusId': learningStatusId
        });

        // Xử lý phản hồi từ Apex
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();

                if (result.startsWith("Student inserted successfully")) {
                    component.set("v.message", "Thêm học sinh thành công!");

                    var notificationLibrary = component.find("notifLib");
                    if (notificationLibrary) {
                        notificationLibrary.showToast({
                            "title": "Thành công!",
                            "message": "Học sinh đã được thêm vào hệ thống.",
                            "variant": "success"
                        });
                    }

                    // Reset form
                    component.set("v.Firstname__c", "");
                    component.set("v.Lastname__c", "");
                    component.set("v.Birthday__c", null);
                    component.set("v.student.Class_look__c", null);
                    component.set("v.student.Gender__c", null);
                    component.set("v.student.LearningStatus__c", null);



                    var cmpEvent = component.getEvent("CMP_Reload");
                    if (cmpEvent) {
                        cmpEvent.fire();
                        // super special for reload and update number student
                        // $A.get('e.force:refreshView').fire();
                        helper.reloadData(component);
                    } else {
                        console.error("CMP_Reload event not found.");
                    }

                } else {
                    var notificationLibrary = component.find("notifLib");
                    if (notificationLibrary) {
                        notificationLibrary.showToast({
                            "title": "Lỗi!",
                            "message": result,
                            "variant": "error"
                        });
                    }
                    component.set("v.message", "Lỗi khi thêm học sinh.");
                }
            } else {
                var errors = response.getError();
                var errorMessage = (errors && errors[0] && errors[0].message) ? errors[0].message : "Lỗi không xác định.";

                var notificationLibrary = component.find("notifLib");
                if (notificationLibrary) {
                    notificationLibrary.showToast({
                        "title": "Lỗi!",
                        "message": "Lỗi khi thêm học sinh: " + errorMessage,
                        "variant": "error"
                    });
                }
                console.error("Lỗi:", errorMessage);
                component.set("v.message", "Đã xảy ra lỗi khi thêm học sinh.");
            }
        });

        // Đẩy hành động vào hàng đợi
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

    // Fuction get data from picklist
    fetchPicklistOptions: function (component, methodName, attributeName) {
        var action = component.get("c." + methodName); // Lấy phương thức Apex động
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var options = response.getReturnValue(); // Kết quả trả về từ Apex
                console.log(attributeName + " options returned:", options); // Debugging the response

                // Gán giá trị cho thuộc tính của component
                component.set("v." + attributeName, options);
            } else {
                console.error("Error loading " + attributeName + " options:", response.getError());
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




});
