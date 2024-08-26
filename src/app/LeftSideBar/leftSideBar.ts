import { Component, EventEmitter, signal, Output, OnInit } from '@angular/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormControl } from '@angular/forms';
@Component({
    selector: 'app-leftsidebar',
    templateUrl: './leftSideBar.html',
    styleUrls: ['./leftSideBar.css'],
    standalone: true,
    imports: [MatButtonToggle, MatButtonToggleGroup]
})
export class LeftSideBar{
    selectedValues: string[][] = [];
    @Output() togglesChanged = new EventEmitter<string[][]>();

    hideSingleSelectionIndicator = signal(false);
    hideMultipleSelectionIndicator = signal(false);

    toggleControl = new FormControl();

    onToggleChanged2024(event: string[]) {
        this.selectedValues[0] = event
        this.emitToggleChange()
    }
    onToggleChanged2020(event: string[]) {
        this.selectedValues[1] = event
        this.emitToggleChange()
    }
    onToggleChanged2016(event: string[]) {
        this.selectedValues[2] = event
        this.emitToggleChange()
    }
    emitToggleChange() {
        this.togglesChanged.emit(this.selectedValues)
    }

}