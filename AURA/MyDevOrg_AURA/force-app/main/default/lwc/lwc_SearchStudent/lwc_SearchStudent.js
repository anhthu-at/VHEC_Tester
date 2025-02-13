import { LightningElement, wire, track } from 'lwc';
import getStudents from '@salesforce/apex/LWC_SearchStudentCtrl.getStudents';
import searchStudentByCriteria from '@salesforce/apex/LWC_SearchStudentCtrl.searchStudentByCriteria';
import getGenderOptions from '@salesforce/apex/LWC_SearchStudentCtrl.getGenderOptions';
import getTotalStudentCount from '@salesforce/apex/LWC_SearchStudentCtrl.getTotalStudentCount';
import deleteStudents from '@salesforce/apex/LWC_SearchStudentCtrl.deleteStudents';

export default class LwcSearchStudent extends LightningElement {
    @track students = [];
    @track error;

    // search
    @track studentCode = '';
    @track fullName = '';
    @track classCode = '';
    @track startBirthDate = '';
    @track endBirthDate = '';
    @track selectedValueGender = '';

    // modal detail
    @track isDetailModalOpen = false;
    // use 3 modal
    @track selectedStudentId;
    // modal update
    @track isUpdateModalOpen = false;
    // modal delete
    @track isDeleteModalOpen = false;
    // modal create
    @track isCreateModalOpen = false;

    // page
    @track currentPage = 1;
    @track totalPages = 1;
    @track pageSize = 10;
    @track totalRecords = 0;

    // page if list result > 10 student
    @track isSearching = false; // Biến để theo dõi trạng thái tìm kiếm

    @track lastRecordId = null;
    @track hasMoreRecords = false;
    @track isLoading = false;


    // Fetch gender options
    @wire(getGenderOptions)
    wiredGenderOptions({ error, data }) {
        if (data) {
            this.genderOptions = data.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error fetching gender options:', error);
        }
    }
    // get value gender for search
    handleGenderChange(event) {
        this.selectedValueGender = event.target.value;
    }
    //    modal detail
    openDetailModal(event) {
        this.selectedStudentId = event.target.value;  // Lấy studentId từ nút click
        this.isDetailModalOpen = true;  // Mở modal
    }
    closeDetailModal() {
        this.isDetailModalOpen = false;
    }
    //    modal update
    openUpdateModal(event) {
        this.selectedStudentId = event.target.value;  // Lấy studentId từ nút click
        this.isUpdateModalOpen = true;  // Mở modal
    }
    closeUpdateModal() {
        this.isUpdateModalOpen = false;
    }
    // modal create
    openCreateModal(event) {
        this.selectedStudentId = event.target.value;  // Lấy studentId từ nút click
        this.isCreateModalOpen = true;  // Mở modal
    }
    closeCreateModal() {
        this.isCreateModalOpen = false;
    }
    //function delete student in button
    openDeleteModal(event) {
        this.selectedStudentId = event.target.value;
        this.isDeleteModalOpen = true;
    }
    closeDeleteModal() {
        this.isDeleteModalOpen = false;
    }
    // clear form
    clearForm() {
        // Cập nhật giá trị của các input trong template
        const studentCodeInput = this.template.querySelector('[data-id="studentCode"]');
        if (studentCodeInput) studentCodeInput.value = '';

        const fullNameInput = this.template.querySelector('[data-id="studentName"]');
        if (fullNameInput) fullNameInput.value = '';

        const classCodeInput = this.template.querySelector('[data-id="studentClass"]');
        if (classCodeInput) classCodeInput.value = '';

        const startBirthDateInput = this.template.querySelector('[data-id="studentStartBDay"]');
        if (startBirthDateInput) startBirthDateInput.value = '';

        const endBirthDateInput = this.template.querySelector('[data-id="studentEndBDay"]');
        if (endBirthDateInput) endBirthDateInput.value = '';

        // Reset combobox value for gender
        const genderCombobox = this.template.querySelector('[data-id="studentGender"]');
        if (genderCombobox) genderCombobox.value = '';
    }


    // pagegitation
    @wire(getTotalStudentCount)
    wiredTotalCount({ error, data }) {
        if (data) {
            this.totalRecords = data; // Tổng số sinh viên
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize); // Tính tổng số trang
            this.loadStudents(); // Tải dữ liệu sinh viên cho trang đầu tiên
        } else if (error) {
            console.error('Error fetching total student count:', error);
        }
    }

    // caculate number +-2
    get pageList() {
        const pages = [];
        const pageRange = 2; // Number of pages to show before and after the current page

        // Start and end page number calculations
        let startPage = Math.max(this.currentPage - pageRange, 1);
        let endPage = Math.min(this.currentPage + pageRange, this.totalPages);

        // Ensure that there are always 5 page buttons (if there are that many pages)
        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(5, this.totalPages); // Show first 5 pages
            } else {
                startPage = Math.max(this.totalPages - 4, 1); // Show last 5 pages
            }
        }

        // Generate the list of pages to display
        for (let i = startPage; i <= endPage; i++) {
            pages.push({
                number: i,
                buttonClass: i === this.currentPage ? 'slds-button_brand' : 'slds-button_neutral', // Highlight the current page
            });
        }

        return pages;
    }

    // Check if it's the first page
    get isFirstPage() {
        return this.currentPage === 1;
    }

    // Check if it's the last page
    get isLastPage() {
        return this.currentPage === this.totalPages;
    }


    // gọi để load list first page 10 student
    connectedCallback() {
        this.loadStudents(); // Tải sinh viên cho trang đầu tiên
    }


    confirmDelete() {
        if (!this.selectedStudentId) {
            console.error('No student ID selected.');
            return;
        }
        console.log('Selected Student ID:', this.selectedStudentId);

        deleteStudents({ studentIds: this.selectedStudentId })
            .then(() => {
                // Xử lý thành công, có thể đóng modal hoặc cập nhật UI
                console.log(`${this.selectedStudentIds.length} students have been deleted.`);
                this.closeDeleteModal();
                // Thực hiện thêm hành động nếu cần, ví dụ: làm mới danh sách sinh viên
            })
            .catch((error) => {
                // Xử lý lỗi nếu có
                console.error('Error deleting students: ', error);
                this.closeDeleteModal();
            });
    }

    // Pagegination
    nextPage() {
        if (!this.isLastPage) {
            this.currentPage++; // Tăng trang hiện tại lên

            // Kiểm tra xem có đang tìm kiếm không
            if (this.isSearching) {
                console.log('✅ Đang tìm kiếm trang tiếp theo, trang hiện tại: ', this.currentPage);
                this.searchStudents(); // Thực hiện tìm kiếm với trang đã cập nhật
            } else {
                console.log('✅ Đang tải sinh viên trang tiếp theo, trang hiện tại: ', this.currentPage);
                this.loadStudents(); // Tải sinh viên cho trang tiếp theo nếu không tìm kiếm
            }
        } else {
            console.log('❌ Bạn đã ở trang cuối cùng!');
        }
    }

    loadStudents() {
        if (this.isSearching) {
            // Đã đang tìm kiếm, gọi searchStudents với các điều kiện tìm kiếm hiện tại
            this.searchStudents();
        } else {
            // Chưa tìm kiếm, lấy tất cả sinh viên
            getStudents({ pageNumber: this.currentPage, pageSize: this.pageSize })
                .then(result => {
                    this.students = result; // Cập nhật danh sách sinh viên
                })
                .catch(error => {
                    console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
                });
        }
    }

    searchStudents() {
        this.isSearching = true; // Đánh dấu là đang tìm kiếm
        let studentCode = this.template.querySelector('[data-id="studentCode"]')?.value || '';
        let fullName = this.template.querySelector('[data-id="studentName"]')?.value || '';
        let classCode = this.template.querySelector('[data-id="studentClass"]')?.value || '';
        let startBirthDate = this.template.querySelector('[data-id="studentStartBDay"]')?.value || '';
        let endBirthDate = this.template.querySelector('[data-id="studentEndBDay"]')?.value || '';
        let gender = this.selectedValueGender || '';

        if (startBirthDate) {
            startBirthDate = new Date(startBirthDate);
        } else {
            startBirthDate = null;
        }

        if (endBirthDate) {
            endBirthDate = new Date(endBirthDate);
        } else {
            endBirthDate = null;
        }

        console.log('✅ DEBUG: Kết quả input', studentCode, fullName,
            classCode, startBirthDate, endBirthDate, gender);

        searchStudentByCriteria({
            studentCode,
            fullName,
            classCode,
            gender,
            startBirthDate,
            endBirthDate,
            pageNumber: this.currentPage, // Truyền số trang hiện tại
            pageSize: this.pageSize // Truyền kích thước trang
        })
            .then(result => {
                console.log('✅ DEBUG: Kết quả trả về từ Apex', result);
                this.students = result; // Cập nhật danh sách sinh viên
            })
            .catch(error => {
                console.error('❌ Lỗi khi gọi Apex:', error);
                this.students = [];
                this.isSearching = false; // Đặt lại cờ tìm kiếm nếu có lỗi
            });
    }


    changePage(event) {
        const pageNumber = parseInt(event.target.label, 10);
        if (pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            if (this.isSearching) {
                // Đã tìm kiếm, gọi lại searchStudents để tải dữ liệu cho trang tiếp theo
                this.searchStudents();
            } else {
                // Chưa tìm kiếm, phân trang trên danh sách tất cả sinh viên
                this.loadStudents();
            }
        }
    }

    firstPage() {
        this.currentPage = 1;
        if (this.isSearching) {
            this.searchStudents();
        } else {
            this.loadStudents();
        }
    }

    lastPage() {
        this.currentPage = this.totalPages;
        if (this.isSearching) {
            this.searchStudents();
        } else {
            this.loadStudents();
        }
    }

}