public with sharing class CMP_DetailStudent {

    @AuraEnabled
    public static Student__c getStudentDetails(String studentID) {
        try {
            // Kiểm tra xem studentID có phải null không trước khi truy vấn
            if (studentID == null || String.isEmpty(studentID)) {
                throw new AuraHandledException('Mã sinh viên không hợp lệ');
            }

            Student__c student = [SELECT Id, StudentCode__c, Firstname__c, Lastname__c, Name, Birthday__c,
                                  Gender__c, LearningStatus__c, Class_look__c, TotalCredit__c, GPAScore__c,
                                  Class_look__r.Id, Class_look__r.Name
                           FROM Student__c 
                           WHERE Id = :studentID 
                          ];

            return student; 
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching student details: ' + e.getMessage());
        }
    }

    
    
}
