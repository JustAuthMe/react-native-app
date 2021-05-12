import Translator from "../i18n/Translator";

export class DateModel {
    fromJsDateToHumanDate(date) {
        if (date === null || date.getDate() === null || typeof date !== 'object')
            return '';

        const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
        const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
        return Translator.t('date_format', {day: day, month: month, year: date.getFullYear()});
    }

    fromJsToStorableDate(date) {
        if (date === null || date.getDate() === null || typeof date !== 'object')
            return '1970-01-01';

        const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
        const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
        return date.getFullYear() + '-' + month + '-' + day;
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
