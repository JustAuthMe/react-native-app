export class DropdownSingleton {
    static dropdown;

    static get() {
        return this.dropdown;
    }

    static set(dropdown) {
        this.dropdown = dropdown;
    }
}