import React from 'react';
import {
    StyleSheet,
    View,
    Button,
    DatePickerIOS
} from 'react-native';

export default class DatePickerKeyboardIOS extends React.Component {

    static size = 250;
    static styles = {
        margin: {
            opened: 0,
            closed: -250
        }
    };

    state = {
        opened: false,
        minimumDate: this.props.minimumDate || new Date('1900-01-01T00:00:00'),
        maximumDate: this.props.maximumDate || new Date((new Date().getFullYear()) + '-12-31T00:00:00')
    };

    render() {
        return (
            <View
                style={{
                    position: 'absolute',
                    zIndex: 2,
                    bottom: 0,
                    width: '100%',
                    height: DatePickerKeyboardIOS.size,
                    backgroundColor: 'white',
                    marginBottom: this.state.opened ?
                        DatePickerKeyboardIOS.styles.margin.opened :
                        DatePickerKeyboardIOS.styles.margin.closed,
                    borderTopWidth: 1,
                    borderTopColor: '#ccc',
                    borderTopStyle: 'solid'
                }}>
                <View style={styles.tabBar}>
                    <Button
                        style={styles.button}
                        onPress={() => this.setState({opened: false})}
                        title={"Cancel"}
                        accessibilityLabel={"Close the date picker"}
                    />
                    <Button
                        style={styles.button}
                        onPress={() => {
                            this.props.onDone();
                            this.setState({opened: false});
                        }}
                        title={"Done"}
                        accessibilityLabel={"Validate the date"}
                    />
                </View>
                <DatePickerIOS
                    date={this.props.date}
                    onDateChange={this.props.onDateChange}
                    minimumDate={this.state.minimumDate}
                    maximumDate={this.state.maximumDate}
                    mode={'date'}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        height: 30,
        fontWeight: 'bold'
    },
    datePicker: {
        height: 220
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});
