export class DatePickerSingleton {
    static datepicker;

    static get() {
        return this.datepicker;
    }

    static set(datepicker) {
        this.datepicker = datepicker;
    }
}