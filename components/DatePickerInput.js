import React from 'react';
import {
    View,
    StyleSheet, Button, DatePickerIOS, TextInput, TouchableOpacity
} from 'react-native';
import DatePickerKeyboardIOS from "./DatePickerKeyboardIOS";

export default class DatePickerInput extends React.Component {
    state = {
        currentDate: new Date(),
        inputValue: ''
    };

    changeDate() {
        const date = this.state.currentDate;
        const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
        const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
        const humanDate = day + '/' + month + '/' + date.getFullYear();
        this.props.onChangeText(humanDate);
        this.setState({
            inputValue: humanDate
        });
        this.refs.datePicker.setState({opened: false});
    }

    render() {
        return (
            <View style={styles.content}>
                <DatePickerKeyboardIOS
                    ref={'datePicker'}
                    date={this.state.currentDate}
                    onDateChange={(date) => this.setState({currentDate: date})}
                    onDone={() => this.changeDate()}
                />
                <TouchableOpacity activeOpacity={.5} style={styles.inputTouchable} onPress={() => this.refs.datePicker.setState({opened: true})}>
                    <TextInput
                        ref={'dateInput'}
                        style={this.props.style}
                        placeholder={this.props.placeholder || "e.g. 02/05/1974"}
                        placeholderTextColor={this.props.placeholderTextColor || "rgba(255,255,255,.5)"}
                        returnKeyType={this.props.returnKeyType || 'done'}
                        autoCorrect={false}
                        spellCheck={false}
                        editable={false}
                        onChangeText={this.props.onChangeText}
                        pointerEvents={"none"}
                        value={this.state.inputValue}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    inputTouchable: {
        width: '100%',
        alignItems: 'center'
    },
});
