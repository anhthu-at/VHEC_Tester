import { LightningElement, api, wire, track } from 'lwc';
import getStudentDetails from '@salesforce/apex/LWC_DetailStudentCtrl.getStudentDetails';
import updateStudentDetails from '@salesforce/apex/LWC_UpdateStudentCtrl.updateStudentDetails';
import getGenderOptions from '@salesforce/apex/LWC_UpdateStudentCtrl.getGenderOptions';
import getLearningStatusOptions from '@salesforce/apex/LWC_UpdateStudentCtrl.getLearningStatusOptions';
import getClassOptions from '@salesforce/apex/LWC_UpdateStudentCtrl.getClassOptions';

export default class Lwc_UpdateStudent extends LightningElement {
    @track student = {
        Firstname__c: '',
        Lastname__c: '',
        Birthday__c: '',
        Gender__c: '',
        Class_look__c: '',
        LearningStatus__c: ''
    };

    // get id from page search
    @api recordId;
    @api studentID = "a00dM00000cT1UHQA0"; // Hardcoded student ID

    error;
    genderOptions = [];
    learningStatusOptions = [];
    classOptions = [];


    // Get student details from Apex
    @wire(getStudentDetails, { studentID: '$recordId' })
    wiredStudent({ error, data }) {
        if (data) {
            console.log("Student Data:", JSON.stringify(data)); // Check student data
            this.student = data;
            this.error = undefined;
        } else if (error) {
            console.error("Error fetching student data:", JSON.stringify(error)); // Log error
            this.student = undefined;
            this.error = 'Error fetching student details.';
        }
    }

    // Get picklist values for Gender from Apex
    @wire(getGenderOptions)
    wiredGenderOptions({ error, data }) {
        if (data) {
            this.genderOptions = data;
            this.error = undefined;
        } else if (error) {
            console.error("Error fetching gender options:", error);
            this.error = 'Error fetching gender options.';
        }
    }

    // Get picklist values for Learning Status from Apex
    @wire(getLearningStatusOptions)
    wiredLearningStatusOptions({ error, data }) {
        if (data) {
            this.learningStatusOptions = data;
            this.error = undefined;
        } else if (error) {
            console.error("Error fetching learning status options:", error);
            this.error = 'Error fetching learning status options.';
        }
    }

    // Get class options from Apex
    @wire(getClassOptions)
    wiredClassOptions({ error, data }) {
        if (data) {
            this.classOptions = data.map(cls => ({
                label: cls.Name,
                value: cls.Id
            }));
            this.error = undefined;
        } else if (error) {
            console.error("Error fetching class options:", error);
            this.error = 'Error fetching class options.';
        }
    }

    // Update student record using the Apex method
    handleUpdateStudent() {
        if (this.student) {
            console.log('Student data before update:', this.student);
            console.log('First Name:', this.student.Firstname__c);
            console.log('Last Name:', this.student.Lastname__c);
            console.log('Gender:', this.student.Gender__c);
            console.log('Learning Status:', this.student.LearningStatus__c);
            console.log('Class:', this.student.Class_look__c);
            console.log('Student data before update:', this.student);

            updateStudentDetails({ student: this.student })
                .then((result) => {
                    console.log('Update success:', result);
                    console.log('Updated student data:', JSON.stringify(this.student)); // Log the current state of the student object

                    // If the update is successful, set the success message
                    this.error = undefined;
                    this.successMessage = result;  // result will contain the success message from Apex
                })
                .catch(error => {
                    // If an error occurs, set the error message
                    this.successMessage = undefined;
                    this.error = error.body.message || 'An error occurred while updating the student.';
                    console.error("Error updating student:", error);
                });
        } else {
            this.error = 'No student data found to update.';
            this.successMessage = undefined;
        }
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;

        // Cập nhật giá trị trong student object
        this.student = { ...this.student, [fieldName]: fieldValue };
    }

}
