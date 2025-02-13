public with sharing class CMP_SearchStudentCtrls {
    public CMP_SearchStudentCtrls() {

    }
    @AuraEnabled
    public static Student__c searchStudentByCode(String studentCode) {
        if (String.isEmpty(studentCode)) {
            return null;
        }

        // Search for the student by code or name
        List<Student__c> students = [SELECT Id, StudentCode__c, Firstname__c, Lastname__c, Birthday__c, Gender__c, LearningStatus__c 
                                      FROM Student__c 
                                      WHERE StudentCode__c = :studentCode 
                                      ];
        
        if (students.size() > 0) {
            return students[0]; // Return the first match
        } else {
            return null; // No student found
        }
    }

    @AuraEnabled
    public static List<Student__c> searchStudentByCriteria(String studentCode, 
        String fullName, String classCode, 
        Date startBirthDate, Date endBirthDate, 
        String gender) {
        
        // Bắt đầu truy vấn cơ bản
        String query = 'SELECT Id, StudentCode__c, Firstname__c, Lastname__c, Birthday__c, Gender__c, LearningStatus__c, Class_look__r.Name FROM Student__c WHERE ';
        List<String> conditions = new List<String>();

        // Thêm các điều kiện vào truy vấn dựa trên các tham số đầu vào
        if (String.isNotBlank(studentCode)) {
            conditions.add('StudentCode__c = :studentCode');
        }
        if (String.isNotBlank(fullName)) {
            conditions.add('(Firstname__c LIKE :fullName OR Lastname__c LIKE :fullName)');
        }
        if (String.isNotBlank(classCode)) {
            conditions.add('Class_look__r.Name = :classCode');
        }
        if (startBirthDate != null && endBirthDate != null) {
            conditions.add('Birthday__c >= :startBirthDate AND Birthday__c <= :endBirthDate');
        } else if (startBirthDate != null) {
            conditions.add('Birthday__c >= :startBirthDate');
        } else if (endBirthDate != null) {
            conditions.add('Birthday__c <= :endBirthDate');
        }
        if (String.isNotBlank(gender)) {
            conditions.add('Gender__c = :gender');
        }

        // Nếu không có điều kiện nào, ném ngoại lệ
        if (conditions.isEmpty()) {
            throw new AuraHandledException('Please provide at least one search criteria.');
        }

        // Kết hợp các điều kiện vào truy vấn
        query += String.join(conditions, ' AND ');

        // Ghi lại truy vấn để kiểm tra
        System.debug('Generated Query: ' + query);

        // Thực thi truy vấn
        List<Student__c> students = Database.query(query);
        return students;
    }

    @AuraEnabled
    public static List<Student__c> getStudents() {
        List<Student__c> students = [SELECT Id, 
        StudentCode__c, Firstname__c, Lastname__c, Class_look__r.Name, 
        Birthday__c, Gender__c, LearningStatus__c 
        FROM Student__c
        ORDER BY StudentCode__c ASC];
        // System.debug('Fetched students: ' + students);
        return students;
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
    public static void deleteStudentRecords(List<String> studentIds) {
        // System.debug('Student IDs received from JS: ' + studentIds);
        // System.debug('Type of studentIds: ' + JSON.serialize(studentIds));
        
        // Kiểm tra nếu danh sách studentIds không hợp lệ
        if (studentIds == null || studentIds.isEmpty()) {
            throw new AuraHandledException('Danh sách sinh viên cần xóa không hợp lệ.');
        }
    
        try {
            // Truy vấn SOQL với ID đã được kiểm tra
            List<Student__c> studentsToDelete = [SELECT Id FROM Student__c WHERE Id IN :studentIds];
    
            // In kết quả trả về từ truy vấn SOQL
            System.debug('Students found: ' + studentsToDelete);
    
            // Kiểm tra nếu có bản ghi nào được trả về
            if (studentsToDelete == null || studentsToDelete.isEmpty()) {
                throw new AuraHandledException('Không tìm thấy sinh viên để xóa.');
            }
    
            // Xóa các bản ghi
            delete studentsToDelete;
            System.debug('Delete operation successful');
    
        } catch (DmlException e) {
            System.debug('DML error during delete: ' + e.getMessage());
            throw new AuraHandledException('Lỗi khi xóa sinh viên: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Lỗi không xác định: ' + e.getMessage());
            throw new AuraHandledException('Lỗi không xác định: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Student__c getStudentIds(String studentId) {
        // Truy vấn dữ liệu từ Salesforce
        Student__c student = [SELECT Id, StudentCode__c, Firstname__c, Lastname__c, 
        Birthday__c, Gender__c, Class_look__r.Name, LearningStatus__c 
        FROM Student__c 
        WHERE Id = :studentId ];
        return student;
    }



    @AuraEnabled
    public static List<Map<String, String>> getClassOptions() {
        List<Map<String, String>> options = new List<Map<String, String>>();

        // Add a default '--Select--' option
        options.add(new Map<String, String>{ 'value' => '', 'label' => '--Select--' });

        // Query for Class__c records (Id and Name)
        List<Class__c> listClass = [SELECT Id, Name FROM Class__c ORDER BY Name ASC];

        // Add each class to the list as a map
    for (Class__c cls : listClass) {
        options.add(new Map<String, String>{ 
            'value' => cls.Id, 
            'label' => cls.Name 
        });
    }
        return options;
    }

    @AuraEnabled
    public static Integer getRecordsPerPage() {
        // Lấy giá trị từ Custom Setting
        StudentManageSetting__c settings = StudentManageSetting__c.getInstance('Default'); // 'Default' là tên của record trong Custom Setting
        
        // Kiểm tra giá trị của Custom Setting và trả về giá trị số trang
        if (settings != null && settings.S_RecordPerPage__c != null) {
            return settings.S_RecordPerPage__c.intValue();
        }
        return 5; // Giá trị mặc định nếu không có giá trị trong Custom Setting
    }


    
}
