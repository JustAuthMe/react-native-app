export class DateModel {
    fromJsDateToHumanDate(date) {
        const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
        const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
        return day + '/' + month + '/' + date.getFullYear();
    }
}