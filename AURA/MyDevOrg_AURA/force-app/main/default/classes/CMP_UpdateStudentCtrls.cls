public with sharing class CMP_UpdateStudentCtrls {

    @AuraEnabled
    public static void updateStudentRecord(Student__c student) {
        try {
            // Giả sử First_Name__c và Last_Name__c là các API Name đúng
            if (student.Firstname__c != null && student.Lastname__c != null) {
                student.Name = student.Firstname__c + ' ' + student.Lastname__c;
            } else {
                throw new AuraHandledException('First Name and Last Name must not be null.');
            }

            // Cập nhật bản ghi
            update student;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating student record: ' + e.getMessage());
        }
    }

   @AuraEnabled
    public static String getClassIdByName(String className) {
        try {
            Class__c classRecord = [SELECT Id FROM Class__c WHERE Name = :className ];
            return classRecord.Id;
        } catch (Exception e) {
                throw new AuraHandledException('Class not found');
            }
        }

    @AuraEnabled
    public static List<Map<String, String>> getPicklistValues(String objectName, String fieldName) {
        List<Map<String, String>> options = new List<Map<String, String>>();
        try {
            options.add(new Map<String, String>{ 'value' => '', 'label' => '--Select--' });

            Schema.DescribeSObjectResult objectDescribe = Schema.getGlobalDescribe().get(objectName).getDescribe();
            Schema.DescribeFieldResult fieldDescribe = objectDescribe.fields.getMap().get(fieldName).getDescribe();

            if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
                for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                    options.add(new Map<String, String>{
                        'value' => entry.getValue(),
                        'label' => entry.getLabel()
                    });
                }
            } else {
                throw new IllegalArgumentException(fieldName + ' is not a picklist field.');
            }
        } catch (Exception e) {
            System.debug('Error fetching picklist values: ' + e.getMessage());
        }
        return options;
    }

    @AuraEnabled
    public static List<Map<String, String>> getGenderOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        options.add(new Map<String, String>{ 'value' => '', 'label' => '--Select--' }); // Add first option
    
        // Get data from the picklist
        Schema.DescribeFieldResult genderField = Student__c.Gender__c.getDescribe();
        List<Schema.PicklistEntry> genderValues = genderField.getPicklistValues();
    
        // Add values to the Map
        for (Schema.PicklistEntry genderValue : genderValues) {
            options.add(new Map<String, String>{ 
                'value' => genderValue.getValue(), 
                'label' => genderValue.getLabel() 
            });
        }
        return options;
    }

    @AuraEnabled
    public static List<Map<String, String>> getLearningStatusOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        options.add(new Map<String, String>{ 'value' => '', 'label' => '--Select--' }); // Add first option
    
        // Get data from the picklist
        Schema.DescribeFieldResult LearningStatusField = Student__c.LearningStatus__c.getDescribe();
        List<Schema.PicklistEntry> LearningStatusValues = LearningStatusField.getPicklistValues();
    
        // Add values to the Map
        for (Schema.PicklistEntry LearningStatusValue : LearningStatusValues) {
            options.add(new Map<String, String>{ 
                'value' => LearningStatusValue.getValue(), 
                'label' => LearningStatusValue.getLabel() 
            });
        }
        return options;
    }

    // @AuraEnabled
    // public static List<Map<String, String>> getClassOptions() {
    //     List<Map<String, String>> options = new List<Map<String, String>>();

    //     // Add a default '--Select--' option
    //     options.add(new Map<String, String>{ 'value' => '', 'label' => '--Select--' });

    //     // Query for Class__c records (Id and Name)
    //     List<Class__c> listClass = [SELECT Id, Name FROM Class__c ORDER BY Name ASC];

    //     // Add each class to the list as a map
    // for (Class__c cls : listClass) {
    //     options.add(new Map<String, String>{ 
    //         'value' => cls.Id, 
    //         'label' => cls.Name 
    //     });
    // }
    //     return options;
    // }

    @AuraEnabled
    public static List<Class__c> getClassOptions() {
        return [SELECT Id, Name FROM Class__c]; // Truy vấn danh sách lớp học
    }

    


    @AuraEnabled
    public static Student__c getStudentDetails(String studentID) {
        // Tìm kiếm sinh viên theo StudentCode__c hoặc ID
        Student__c student = [SELECT Id, StudentCode__c, 
                Firstname__c, Lastname__c, Birthday__c, Gender__c,
                LearningStatus__c, Class_look__r.Name
                FROM Student__c WHERE Id = :studentID ];
        return student; 
    }
    
    @AuraEnabled
    public static void updateStudentDetails(Student__c student) {
        try {
            update student; // Update the student record in Salesforce
        } catch (Exception e) {
            throw new AuraHandledException('Error updating student: ' + e.getMessage());
        }
    }


    


}
