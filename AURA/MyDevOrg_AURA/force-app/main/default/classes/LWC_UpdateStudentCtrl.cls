public with sharing class LWC_UpdateStudentCtrl {
    public LWC_UpdateStudentCtrl() {

    }

    @AuraEnabled(cacheable=true)
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

    @AuraEnabled(cacheable=true)
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

    @AuraEnabled(cacheable=true)
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

    @AuraEnabled(cacheable=true)
    public static List<Class__c> getClassOptions() {
        return [SELECT Id, Name FROM Class__c ORDER BY Name ASC]; // Truy vấn danh sách lớp học
    }

    @AuraEnabled(cacheable=false)
    public static String updateStudentDetails(Student__c student) {
        try {
            update student; // Update the student record in Salesforce
            return 'Student data has been successfully updated.';
        } catch (Exception e) {
            throw new AuraHandledException('Error updating student: ' + e.getMessage());
        }
    }
}