import { Injectable } from '@angular/core';
import { Http, Headers, ResponseContentType, Response } from '@angular/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/map';
import Swal from 'sweetalert2'
import { saveAs } from 'file-saver';

const API_URL = environment.apiUrl;
const UPLOAD_DATA_ENDPOINT = environment.uploadDataEndpoint;
const GET_FILES_BLOB_ENDPOINT = environment.getFilesEndpoint;
const GET_FILE_BLOB_ENDPOINT = environment.getFileEndpoint;

const UPLOAD_TOOL_ENDPOINT = environment.uploadToolsEndpoint;
const GET_TOOLS_BLOB_ENDPOINT = environment.getToolsEndpoint;
const DELETE_TOOL_ENPOINT = environment.deleteToolsEnpoint;
const GET_TOOL_ENPOINT = environment.getToolEnpoint;
const DELETE_DATA_ENDPOINT = environment.deleteDataEndpoint;
const GET_PARAMETERS_ENDPOINT = environment.getParametersEndpoint;

const SUBMIT_TASK_ENDPOINT = environment.submitTaskEndpoint;
const GET_RESULTS_BLOB_ENDPOINT = environment.getResultsBlobEndpoints;
const GET_RESULT_ENPOINT = environment.getResultBlobEndpoints;
const STATUS_ENDPOINT = environment.statusEndpoint;
const DOWNLOAD_DATA_ENDPOINT = environment.getResultEndpoints;
const DELETE_RESULT_ENDPOINT = environment.deleteResultEndpoints;

const FOLDERS_ENDPOINT = environment.foldersEndpoints;

const GROUPS_ENDPOINT = environment.groupsEndpoints;

const SHARE_ENDPOINT = environment.shareEndpoint;
const GET_PATH_ENDPOINT = environment.getPathEndpoint;
const MOVE_FOLDER_ENDPOINT = environment.moveFolderEndpoint;

const ADD_GROUP_MEMBER_ENDPOINT = environment.addGroupMemberEndpoint;

@Injectable()
export class SpassService {
  public currentMail: string;

  constructor(private http: Http, public oidcSecurityService: OidcSecurityService) {
  }

  private createHeaders(): Headers {
    var headers: Headers = new Headers();

    const token = this.oidcSecurityService.getToken();
    if (token !== '') {
      const tokenValue = 'Bearer ' + token;
      headers.set('Authorization', tokenValue);
    }

    return headers
  }

  // MARK: - Data

  uploadData(fileToUpload: File, nameOfFile: string): Observable<object> {
    let headers: Headers = this.createHeaders()
    const formData: FormData = new FormData();
    formData.append(nameOfFile, fileToUpload, fileToUpload.name);

    return this.http
    .post(API_URL + UPLOAD_DATA_ENDPOINT, formData, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  deleteData(name: any) {
    let headers: Headers = this.createHeaders()
    return this.http
    .delete(API_URL + DELETE_DATA_ENDPOINT + name.id + '/', { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  getBlobFiles(): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_FILES_BLOB_ENDPOINT, { headers: headers})
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  downloadData(name: any): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_FILE_BLOB_ENDPOINT + name.id + '/', { headers: headers, responseType: ResponseContentType.Blob })
    .map(response => {
      let blob:any = new Blob([response.blob()], { type: 'application/octet-stream; charset=utf-8' });
			saveAs(blob, name["name"]);
      return "ok"
    }).pipe(catchError(this.handleError));
  }

  // MARK: - Tools

  loadParameters(toolid: number) {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_PARAMETERS_ENDPOINT + toolid + '/parameters/', { headers: headers })
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  uploadTool(fileToUpload: File, nameOfFile: string, parameters: string): Observable<object> {
    let headers: Headers = this.createHeaders()
    const formData: FormData = new FormData();
    formData.append(nameOfFile, fileToUpload);
    formData.append('parameters', parameters);

    return this.http
    .post(API_URL + UPLOAD_TOOL_ENDPOINT, formData, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  downloadTool(name: any): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_TOOL_ENPOINT + name.id + '/', { headers: headers, responseType: ResponseContentType.Blob })
    .map(response => {
      let blob:any = new Blob([response.blob()], { type: 'application/octet-stream; charset=utf-8' });
			saveAs(blob, name["name"]);
      return "ok"
    }).pipe(catchError(this.handleError));
  }

  getTools(): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_TOOLS_BLOB_ENDPOINT, { headers: headers })
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  deleteTool(name: any ) {
    let headers: Headers = this.createHeaders()
    return this.http
    .delete(API_URL + DELETE_TOOL_ENPOINT + name.id + '/', { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  // MARK: - Task

  submitTask(definition: object) {
    let headers: Headers = this.createHeaders()
    return this.http.post(API_URL + SUBMIT_TASK_ENDPOINT, definition, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  getResultsFiles(): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_RESULTS_BLOB_ENDPOINT, { headers: headers })
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  getStatus(): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + STATUS_ENDPOINT, { headers: headers })
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  downloadResult(name: any): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_RESULT_ENPOINT + name.id + '/file/', { headers: headers, responseType: ResponseContentType.Blob })
    .map(response => {
      let blob:any = new Blob([response.blob()], { type: 'application/octet-stream; charset=utf-8' });
			saveAs(blob, name["name"]);
      return "ok"
    }).pipe(catchError(this.handleError));
  }

  resultData(name: any): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_RESULT_ENPOINT + name.id + '/', { headers: headers })
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  deleteResult(name: any): Observable<any> {
    let headers: Headers = this.createHeaders()
    return this.http
    .delete(API_URL + DELETE_RESULT_ENDPOINT + name.id + '/', { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  // MARK: - Error Handling

  handleError(response: any) {
    switch (response.status) {
        case 403:
          Swal.fire("Invalid Permissions", "You do not have enought permissions", "error");
          break;
        case 400:
        case 500:
          Swal.fire("Server error", "Something went wrong", "error");
          break;
        case 401:
          break;
        default:
          break;
    }
    return throwError(response);
  }

  // MARK: - Sharing

  movePath(data: any, folderId: number, permission: string): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .patch(API_URL + MOVE_FOLDER_ENDPOINT(data.id), {folderId: folderId, entity: data, permission: permission}, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  getPath(data: any): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_PATH_ENDPOINT(data.id), { headers: headers })
    .map(response => {
      return response.json().path;
    }).pipe(catchError(this.handleError));
  }

  shareWithGroup(sharingData: any, groupId: number, permission: string): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .post(API_URL + SHARE_ENDPOINT(sharingData.id), {groupId: groupId, entity: sharingData, permission: permission}, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  share(sharingData: any, email: string, permission: string): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .post(API_URL + SHARE_ENDPOINT(sharingData.id), {email: email, entity: sharingData, permission: permission}, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  addGroupMember(group: any, member: string): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .post(API_URL + ADD_GROUP_MEMBER_ENDPOINT(group.id), {email: member, group: group}, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  // MARK: - Folders

  createFolder(name): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .post(API_URL + FOLDERS_ENDPOINT, {name: name}, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  deleteFolder(id): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .delete(API_URL + FOLDERS_ENDPOINT + id + "/", { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  listFolders(): Observable<object> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + FOLDERS_ENDPOINT, { headers: headers })
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  // MARK: - Groups

  createGroup(name): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .post(API_URL + GROUPS_ENDPOINT, {name: name}, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  deleteGroup(id): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .delete(API_URL + GROUPS_ENDPOINT + id + "/", { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  listGroups(): Observable<object> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GROUPS_ENDPOINT, { headers: headers })
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

}
