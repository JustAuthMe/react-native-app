export class DateModel {
    fromJsDateToHumanDate(date) {
        const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
        const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
        return day + '/' + month + '/' + date.getFullYear();
    }

    getFullDate(date) {
        const hour = (date.getHours() < 10 ? '0' : '') + date.getHours();
        const min = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
        const sec = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();

        return this.fromJsDateToHumanDate(date) + ' ' + hour + ':' + min + ':' + sec;
    }

    getUnixTimestamp() {
        return Math.floor((new Date()).getTime() / 1000);
    }
}