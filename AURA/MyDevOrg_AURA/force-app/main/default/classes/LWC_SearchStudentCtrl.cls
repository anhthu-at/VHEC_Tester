public with sharing class LWC_SearchStudentCtrl {

    // @AuraEnabled(cacheable=true)
    // public static List<Student__c> searchStudentByCriteria(
    //     String studentCode,
    //     String fullName,
    //     String classCode,
    //     Date startBirthDate,
    //     Date endBirthDate,
    //     String gender
    // ) {
    //     Integer maxStudents = 10;
    //     String query = 'SELECT Id, StudentCode__c, Firstname__c, Lastname__c, Birthday__c, Gender__c, LearningStatus__c, Class_look__r.Name ' +
    //                 'FROM Student__c ';

    //     List<String> whereConditions = new List<String>();
    //     Map<String, Object> queryParams = new Map<String, Object>();

    //     if (!String.isBlank(studentCode)) {
    //         whereConditions.add('StudentCode__c = :studentCode');
    //         queryParams.put('studentCode', studentCode);
    //     }
    //     if (!String.isBlank(fullName)) {
    //         whereConditions.add('(Firstname__c LIKE :fullName OR Lastname__c LIKE :fullName)');
    //         queryParams.put('fullName', '%' + fullName + '%');
    //     }
    //     if (!String.isBlank(classCode)) {
    //         whereConditions.add('Class_look__r.Name = :classCode');
    //         queryParams.put('classCode', classCode);
    //     }
    //     if (startBirthDate != null) {
    //         whereConditions.add('Birthday__c >= :startBirthDate');
    //         queryParams.put('startBirthDate', startBirthDate);
    //     }
    //     if (endBirthDate != null) {
    //         whereConditions.add('Birthday__c <= :endBirthDate');
    //         queryParams.put('endBirthDate', endBirthDate);
    //     }
    //     if (!String.isBlank(gender)) {
    //         whereConditions.add('Gender__c = :gender');
    //         queryParams.put('gender', gender);
    //     }

    //     if (!whereConditions.isEmpty()) {
    //         query += ' WHERE ' + String.join(whereConditions, ' AND ');
    //     }

    //     query += ' LIMIT ' + maxStudents;

    //     System.debug('✅ DEBUG: Query SOQL = ' + query);

    //     try {
    //         List<Student__c> students = Database.query(query);
    //         System.debug('✅ DEBUG: Kết quả truy vấn = ' + students);
    //         return students;
    //     } catch (Exception e) {
    //         System.debug('❌ ERROR: ' + e.getMessage());
    //         return new List<Student__c>(); // Trả về danh sách rỗng nếu có lỗi
    //     }
    // }

    @AuraEnabled(cacheable=true)
    public static List<Student__c> searchStudentByCriteria(
        String studentCode,
        String fullName,
        String classCode,
        Date startBirthDate,
        Date endBirthDate,
        String gender,
        Integer pageNumber, // Added pagination
        Integer pageSize   // Added pagination
    ) {
        // Default maxStudents to pageSize if not provided
        if (pageSize == null) {
            pageSize = 10; // Default to 10 if pageSize is not provided
        }
        Integer offset = (pageNumber - 1) * pageSize; // Calculate offset for pagination
        
        String query = 'SELECT Id, StudentCode__c, Firstname__c, Lastname__c, Birthday__c, Gender__c, LearningStatus__c, Class_look__r.Name ' +
                    'FROM Student__c ';

        List<String> whereConditions = new List<String>();
        Map<String, Object> queryParams = new Map<String, Object>();

        if (!String.isBlank(studentCode)) {
            whereConditions.add('StudentCode__c = :studentCode');
            queryParams.put('studentCode', studentCode);
        }
        if (!String.isBlank(fullName)) {
            whereConditions.add('(Firstname__c LIKE :fullName OR Lastname__c LIKE :fullName)');
            queryParams.put('fullName', '%' + fullName + '%');
        }
        if (!String.isBlank(classCode)) {
            whereConditions.add('Class_look__r.Name = :classCode');
            queryParams.put('classCode', classCode);
        }
        if (startBirthDate != null) {
            whereConditions.add('Birthday__c >= :startBirthDate');
            queryParams.put('startBirthDate', startBirthDate);
        }
        if (endBirthDate != null) {
            whereConditions.add('Birthday__c <= :endBirthDate');
            queryParams.put('endBirthDate', endBirthDate);
        }
        if (!String.isBlank(gender)) {
            whereConditions.add('Gender__c = :gender');
            queryParams.put('gender', gender);
        }

        if (!whereConditions.isEmpty()) {
            query += ' WHERE ' + String.join(whereConditions, ' AND ');
        }

        // Apply pagination
        query += ' LIMIT ' + pageSize + ' OFFSET ' + offset;

        System.debug('✅ DEBUG: Query SOQL = ' + query);

        try {
            List<Student__c> students = Database.query(query);
            System.debug('✅ DEBUG: Kết quả truy vấn = ' + students);
            return students;
        } catch (Exception e) {
            System.debug('❌ ERROR: ' + e.getMessage());
            return new List<Student__c>(); // Return an empty list in case of an error
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

    // pagination
    @AuraEnabled(cacheable=true)
    public static Integer getTotalStudentCount() {
        // Truy vấn tổng số sinh viên trong hệ thống
        Integer totalCount = [SELECT COUNT() FROM Student__c];
        return totalCount;
    }

    @AuraEnabled(cacheable=true)
    public static List<Student__c> getStudents(Integer pageNumber, Integer pageSize) {
        // Giá trị mặc định cho maxStudents và pageSize
        Integer maxStudents = pageSize != null ? pageSize : 10;

        // Lấy giá trị từ Custom Setting
        StudentManageSetting__c settings = StudentManageSetting__c.getOrgDefaults();
        if (settings != null && settings.S_MaxRecord__c != null) {
            maxStudents = settings.S_MaxRecord__c.intValue(); // Chuyển về kiểu Integer
        }

        // Tính toán giá trị bắt đầu từ đâu (sử dụng `pageNumber` và `pageSize`)
        Integer startIndex = (pageNumber - 1) * maxStudents;

        // Truy vấn danh sách sinh viên với `LIMIT` mà không cần dùng `OFFSET`
        List<Student__c> students = new List<Student__c>();
        
        // Truy vấn tất cả sinh viên (không có `OFFSET`)
        List<Student__c> allStudents = [SELECT Id, StudentCode__c, Firstname__c, Lastname__c, 
                                        Class_look__r.Name, Birthday__c, Gender__c
                                        FROM Student__c 
                                        ORDER BY StudentCode__c ASC];

        // Lọc sinh viên cho trang hiện tại (Dựa trên startIndex và maxStudents)
        for (Integer i = startIndex; i < startIndex + maxStudents && i < allStudents.size(); i++) {
            students.add(allStudents[i]);
        }
        
        return students;
    }

    @AuraEnabled
    public static void deleteStudents(List<String> studentIds) {
        try {
            // Truy vấn các sinh viên theo danh sách ID
            List<Student__c> studentsToDelete = [SELECT Id FROM Student__c WHERE Id IN :studentIds];
            
            // Kiểm tra nếu có sinh viên cần xóa
            if (studentsToDelete.isEmpty()) {
                throw new AuraHandledException('No students found to delete.');
            }
            
            // Xóa các sinh viên
            delete studentsToDelete;
            
            // Log thông báo thành công
            System.debug('Deleted ' + studentsToDelete.size() + ' students.');
        } catch (Exception e) {
            // Xử lý lỗi nếu có
            throw new AuraHandledException('Error deleting students: ' + e.getMessage());
        }
    }
    

}
