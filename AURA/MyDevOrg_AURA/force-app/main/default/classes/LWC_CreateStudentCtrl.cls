public with sharing class LWC_CreateStudentCtrl {
    public LWC_CreateStudentCtrl() {

    }
    @AuraEnabled(cacheable=false)
    public static String insertStudentValue(String firstName, String lastName, String birthday, String gender, String classId, String learningStatusId) {
        try {
            // Create a new Student record
            Student__c newStudent = new Student__c();
            newStudent.Firstname__c = firstName;
            newStudent.Lastname__c = lastName;
            newStudent.Birthday__c = Date.valueOf(birthday);  // Assuming birthday is passed in 'yyyy-mm-dd' format
            newStudent.Gender__c = gender;
            newStudent.Class_look__c = classId;
            newStudent.LearningStatus__c  = learningStatusId;
            
            // Insert the new record
            insert newStudent;
            
            return 'Student created successfully with ID: ' + newStudent.Id;
        } catch (Exception e) {
            // Handle exceptions and return the error message
            return 'Error: ' + e.getMessage();
        }
    }
    

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getPicklistValues(String objectName, String fieldName) {
        List<Map<String, String>> options = new List<Map<String, String>>();
        try {
            options.add(new Map<String, String>{ 'value' => '', 'label' => '--なし--' });

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
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getGenderOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        options.add(new Map<String, String>{ 'value' => '', 'label' => '--なし--' }); // Add first option
    
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

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getLearningStatusOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        options.add(new Map<String, String>{ 'value' => '', 'label' => '--なし--' }); // Add first option
    
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

    @AuraEnabled(cacheable=true)
    public static List<Class__c> getClassOptions() {
        return [SELECT Id, Name FROM Class__c ORDER BY Name ASC]; // Truy vấn danh sách lớp học
    }
}