import React from 'react';
import {
    View,
    StyleSheet,
    Platform,
    DatePickerAndroid
} from 'react-native';
import DatePickerKeyboardIOS from "./DatePickerKeyboardIOS";

export default class UniversalDatePicker extends React.Component {
    state = {
        date: new Date(),
        onDone: null,
        onDateChange: null,
        minimumDate: new Date('1900-01-01T00:00:00'),
        maximumDate: new Date((new Date().getFullYear()) + '-12-31T00:00:00')
    };

    render() {
        if (Platform.OS === 'ios') {
            return (
                <DatePickerKeyboardIOS
                    ref={ref => this.datePickerIos = ref}
                    date={this.state.date}
                    onDone={this.state.onDone}
                    onDateChange={this.state.onDateChange}
                    maximumDate={this.state.maximumDate}
                    minimumDate={this.state.minimumDate}
                />
            );
        }
    }

    async open (options) {
        this.setState(options);
        if (Platform.OS === 'ios') {
            this.datePickerIos.setState({opened: true});
        } else {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: this.state.date,
                minDate: this.state.minimumDate,
                maxDate: this.state.maximumDate,
                mode: 'default'
            });

            if (action === DatePickerAndroid.dateSetAction) {
                this.state.onDateChange(new Date(
                    year + '-' + month + '-' + day + 'T00:00:00'
                ));
                this.state.onDone();
            }
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});