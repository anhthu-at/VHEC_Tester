import { LightningElement , track } from 'lwc';

export default class Lwc_ScoreTable extends LightningElement {
    @track subjects = [
        { code: 'IT010', credits: 4, progressScore: 10, practicalScore: 4, midtermScore: 3, finalExamScore: 3, averageScore: 3.80 },
        { code: 'IT013', credits: 2, progressScore: 10, practicalScore: 8, midtermScore: 3, finalExamScore: 6, averageScore: 5.20 },
        { code: 'PH002', credits: 3, progressScore: 3, practicalScore: 5, midtermScore: 6, finalExamScore: 10, averageScore: 5.30 },
        { code: 'IT014', credits: 2, progressScore: 10, practicalScore: 4, midtermScore: 6, finalExamScore: 10, averageScore: 8.20 }
    ];

    handleExport() {
        // Code xử lý xuất dữ liệu ra PDF
        console.log('Export to PDF clicked');

    }
}