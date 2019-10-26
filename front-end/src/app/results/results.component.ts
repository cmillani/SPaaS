import { Component, OnInit } from '@angular/core';
import { SpassService } from '../spass.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  loggedMail: string;
  results: any;
  selectedResult: any;

  constructor(private apiservice: SpassService) {
   }

  ngOnInit() {
    this.loggedMail = localStorage.getItem('loggedMail');
    this.loadAllResults();
  }

  loadAllResults() {
    this.apiservice.getResultsFiles().subscribe(response => {
      this.results = response;
    });
  }

  selectResult(result: any) {
    this.apiservice.resultData(result).subscribe(response => {
      this.selectedResult = response;
    })
    // this.selectedResult = this.results.filter(result => result.id == id)[0];
  }

  downloadData(result: any) {
    this.apiservice.downloadResult(result).subscribe(response => {
      console.log(response);
    });
  }

  deleteData(result: any) {
    this.apiservice.deleteResult(result).subscribe(response => {
      console.log(response);
      this.loadAllResults();
    }

    )
  }

}
