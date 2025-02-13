public with sharing class LWC_DetailStudentCtrl {
    public LWC_DetailStudentCtrl() {

        
    }

    @AuraEnabled(cacheable=true)
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

    // @AuraEnabled(cacheable=true)
    // public static List<Student__c> getStudentDetails(String studentID) {
    //     try {
    //         if (String.isEmpty(studentID)) {
    //             throw new AuraHandledException('Mã sinh viên không hợp lệ');
    //         }

    //         List<Student__c> students = [SELECT Id, StudentCode__c, Firstname__c, Lastname__c, Birthday__c,
    //                                     Gender__c, LearningStatus__c, Class_look__c, Class_look__r.Name
    //                             FROM Student__c 
    //                             WHERE Id = :studentID];

    //         // Duyệt danh sách sinh viên và kiểm tra nếu Class_look__r là null
    //         for (Student__c student : students) {
    //             if (student.Class_look__r == null) {
    //                 System.debug('⚠️ Cảnh báo: Không có dữ liệu lớp học cho sinh viên ID ' + student.Id);
    //             } else {
    //                 System.debug('✅ Lớp học: ' + student.Class_look__r.Name);
    //             }
    //         }

    //         return students;
    //     } catch (Exception e) {
    //         throw new AuraHandledException('Lỗi khi truy vấn dữ liệu sinh viên: ' + e.getMessage());
    //     }
    // }

    

}