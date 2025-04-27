import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Header/header';
import { GraphComponent } from './Graph/graph';
import { FootComponent } from './Foot/foot';
import { LeftSideBar } from "./LeftSideBar/leftSideBar";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [HeaderComponent, GraphComponent, FootComponent, LeftSideBar]
})
export class AppComponent {
  title = 'my-app';
  @ViewChild(GraphComponent) graph!: GraphComponent;
  selectedOptions: string[][] = [];
  onTogglesChanged(event: string[][]) {
    this.selectedOptions = event;
    this.callleftBarToggle();
  }

  callleftBarToggle(){
    if( this.graph ){
      console.log('val: ', this.selectedOptions)
      this.graph.toggleButtons(this.selectedOptions);
    }
  }
}
