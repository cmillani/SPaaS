import { Component, Input, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SpassService } from '../spass.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-sharemodal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.css'],
  // add NgbModalConfig and NgbModal to the component providers
  providers: [NgbModalConfig, NgbModal]
})
export class ShareModal implements OnInit {

  @Input('sharingData') sharingData: any;
  @Input('isGroup') isGroup: boolean = false;
  email: string;
  permission: string = "1";
  currentModal: NgbModalRef
  selectedGroupId: number
  groups: any
  selectedFolderId: number
  folders: any
  selectedShareIndex: number = 0
  actionTabIndex: number = 0
  originFolder: string

  constructor(private apiService: SpassService, config: NgbModalConfig, private modalService: NgbModal) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.loadGroups()
    this.loadFolders()
  }

  ngOnInit() {
    this.loadOriginPath()
  }

  loadOriginPath() {
    this.apiService.getPath(this.sharingData).subscribe( response => {
      this.originFolder = response
    })
  }

  loadFolders() {
    this.apiService.listFolders().subscribe( response => {
      this.folders = response
      this.selectedFolderId = response[0].id
    })
  }

  loadGroups() {
    this.apiService.listGroups().subscribe( response => {
      this.groups = response
      this.selectedGroupId = response[0].id
    })
  }

  share() {
    if (this.actionTabIndex == 0) {
      if (this.selectedShareIndex == 0) {
        this.shareWithPerson()
      } else if (this.selectedShareIndex == 1) {
        this.shareWithGroup()
      }
    } else if (this.actionTabIndex == 1) {
      this.moveToFolder()
    }
  }

  shareWithGroup() {
    this.apiService.shareWithGroup(this.sharingData, this.selectedGroupId, this.permission).subscribe(response => {
      this.email = null
      this.permission = "1"
      this.currentModal.close()
    });
  }

  shareWithPerson() {
    if (this.isGroup) {
      this.apiService.addGroupMember(this.sharingData, this.email).subscribe(response => {
        this.email = null
        this.permission = "1"
        this.currentModal.close()
      });
    } else {
      this.apiService.share(this.sharingData, this.email, this.permission).subscribe(response => {
        this.email = null
        this.permission = "1"
        this.currentModal.close()
      });
    }
  }

  moveToFolder() {

  }

  actionTabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.actionTabIndex = tabChangeEvent.index;
  }

  shareTabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedShareIndex = tabChangeEvent.index;
  }

  open(content) {
    this.currentModal = this.modalService.open(content, { centered: true });
  }
}
