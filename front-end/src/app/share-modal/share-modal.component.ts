import { Component, Input } from '@angular/core';
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SpassService } from '../spass.service';
import {MatRadioModule} from '@angular/material/radio'

@Component({
  selector: 'app-sharemodal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.css'],
  // add NgbModalConfig and NgbModal to the component providers
  providers: [NgbModalConfig, NgbModal]
})
export class ShareModal {

  @Input('sharingData') sharingData: any;
  email: string;
  permission: string = "1";
  currentModal: NgbModalRef

  constructor(private apiService: SpassService, config: NgbModalConfig, private modalService: NgbModal) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
  }

  share() {
    this.apiService.share(this.sharingData, this.email, this.permission).subscribe(response => {
      this.email = null
      this.permission = "1"
      this.currentModal.close()
    });
  }

  open(content) {
    this.currentModal = this.modalService.open(content, { centered: true });
  }
}