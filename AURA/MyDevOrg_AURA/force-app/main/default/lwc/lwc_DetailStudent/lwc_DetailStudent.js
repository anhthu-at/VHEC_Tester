import { LightningElement, api, wire } from 'lwc';
import getStudentDetails from '@salesforce/apex/LWC_DetailStudentCtrl.getStudentDetails';

export default class Lwc_DetailStudent extends LightningElement {
    @api studentID = "a00dM00000cT1UHQA0"; // Gán cứng ID sinh viên
    student;
    error;
    // modal
    @api recordId;
    studentDetails;

    // Lấy dữ liệu sinh viên từ Apex
    @wire(getStudentDetails, { studentID: '$recordId' })
    wiredStudent({ error, data }) {
        if (data) {
            // console.log("Dữ liệu sinh viên:", JSON.stringify(data)); // Kiểm tra log
            this.student = data;
            this.error = undefined;
        } else if (error) {
            console.error("Lỗi khi lấy dữ liệu sinh viên:", JSON.stringify(error));
            this.student = undefined;
            this.error = 'Lỗi khi lấy dữ liệu sinh viên.';
        }
    }

}
