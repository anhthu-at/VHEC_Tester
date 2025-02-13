import { LightningElement, wire, track } from 'lwc';
import insertStudentValue from '@salesforce/apex/LWC_CreateStudentCtrl.insertStudentValue';
import getGenderOptions from '@salesforce/apex/LWC_CreateStudentCtrl.getGenderOptions';
import getLearningStatusOptions from '@salesforce/apex/LWC_CreateStudentCtrl.getLearningStatusOptions';
import getClassOptions from '@salesforce/apex/LWC_CreateStudentCtrl.getClassOptions';

export default class CreateStudent extends LightningElement {
    @track student = {
        Firstname__c: '',
        Lastname__c: '',
        Birthday__c: '',
        Gender__c: '',
        Class_look__c: '',
        LearningStatus__c: ''
    };

    @track classOptions = [];
    @track genderOptions = [];
    @track learningStatusOptions = [];
    message = '';

    // Fetch class options
    @wire(getClassOptions)
    wiredClassOptions({ error, data }) {
        if (data) {
            this.classOptions = data.map(cls => ({ label: cls.Name, value: cls.Id }));
        } else if (error) {
            console.error('Error fetching class options:', error);
        }
    }

    // Fetch gender options
    @wire(getGenderOptions)
    wiredGenderOptions({ error, data }) {
        if (data) {
            this.genderOptions = data.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error fetching gender options:', error);
        }
    }

    // Fetch learning status options
    @wire(getLearningStatusOptions)
    wiredStatusOptions({ error, data }) {
        if (data) {
            this.learningStatusOptions = data.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error fetching learning status options:', error);
        }
    }

    handleInputChange(event) {
        const field = event.target.name;
        this.student = { ...this.student, [field]: event.target.value };
    }


    insertStudent() {
        if (!this.student.Firstname__c || !this.student.Lastname__c || !this.student.Birthday__c ||
            !this.student.Gender__c || !this.student.Class_look__c || !this.student.LearningStatus__c) {
            console.log('Missing data:',
                this.student.Firstname__c,
                this.student.Lastname__c,
                this.student.Birthday__c,
                this.student.Gender__c,
                this.student.Class_look__c,
                this.student.LearningStatus__c
            );
            this.message = 'Fill value input';
            return;
        }
        console.log('Sending data:', JSON.stringify({
            firstName: this.student.Firstname__c,
            lastName: this.student.Lastname__c,
            birthday: this.student.Birthday__c,
            gender: this.student.Gender__c,
            classId: this.student.Class_look__c,
            learningStatusId: this.student.LearningStatus__c
        }));

        insertStudentValue({
            firstName: this.student.Firstname__c,
            lastName: this.student.Lastname__c,
            birthday: this.student.Birthday__c,
            gender: this.student.Gender__c,
            classId: this.student.Class_look__c,
            learningStatusId: this.student.LearningStatus__c
        })
            .then(result => {
                this.message = result;
            })
            .catch(error => {
                this.message = 'エラー: ' + (error.body?.message || error.message);
                console.error('Error creating student:', error);
            });
    }
}
