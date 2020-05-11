import Translator from "../i18n/Translator";

export class DataModel {
    static isDataRequired(data) {
        return data.indexOf('!') === data.length - 1;
    }

    static getDataSlug(data) {
        if (DataModel.isDataRequired(data)) {
            data = data.slice(0, -1);
        }

        return data;
    }

    static getDataLabelFromID(data) {
        data = DataModel.getDataSlug(data);
        return Translator.t('data_list.' + data);
    }
}