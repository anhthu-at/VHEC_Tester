public with sharing class CMP_CreateStudentCtrls {

    @AuraEnabled
    public static String insertStudentValue(String firstName, String lastName, String birthday, String gender, String classId, String learningStatusId) {
        try {
            // Create a new Student record (replace Student__c with your actual custom object name)
            Student__c newStudent = new Student__c();

            // Set the values for the Student record
            newStudent.FirstName__c = firstName;
            newStudent.LastName__c = lastName;
            newStudent.Birthday__c = Date.valueOf(birthday);
            newStudent.Name = firstName + ' ' + lastName;
            newStudent.Gender__c = gender;
            newStudent.Class_look__c = classId;  // Assuming Class is a lookup to another object
            newStudent.LearningStatus__c = learningStatusId;

            // Insert the new student record
            insert newStudent;

            // Return success message with student ID
            return 'Student inserted successfully with ID: ' + newStudent.Id;
        } catch (Exception e) {
            // Handle any exceptions
            return 'Error occurred while inserting student: ' + e.getMessage();
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
    public static List<String> getStudentIdList(String studentIdStr) {
        if (String.isNotBlank(studentIdStr)) {
            system.debug('studentIdStr: ' + studentIdStr);
            return studentIdStr.split(',');
        } else {
            return new List<String>();
        }
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


    @AuraEnabled
    public static List<Class__c> getClassOptions() {
        return [SELECT Id, Name FROM Class__c]; // Truy vấn danh sách lớp học
    }
  
}
