import { Injectable } from '@angular/core';
import { Http, Headers, ResponseContentType } from '@angular/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/map';
import Swal from 'sweetalert2'

const API_URL = environment.apiUrl;
const CREATE_USER_ENDPOINT = environment.createUserEndpoint;
const AUTH_USER_ENDPOINT = environment.authUserEndpoint;
const UPLOAD_DATA_ENDPOINT = environment.uploadDataEndpoint;
const GET_FILES_BLOB_ENDPOINT = environment.getFilesEndpoint;
const GET_FILE_BLOB_ENDPOINT = environment.getFileEndpoint;
const UPLOAD_TOOL_ENDPOINT = environment.uploadToolsEndpoint;
const GET_TOOLS_BLOB_ENDPOINT = environment.getToolsEndpoint;
const DELETE_TOOL_ENPOINT = environment.deleteToolsEnpoint;
const DELETE_DATA_ENDPOINT = environment.deleteDataEndpoint;
const GET_PARAMETERS_ENDPOINT = environment.getParametersEndpoint;
const SUBMIT_TASK_ENDPOINT = environment.submitTaskEndpoint;
const GET_RESULTS_BLOB_ENDPOINT = environment.getResultsBlobEndpoints;
const STATUS_ENDPOINT = environment.statusEndpoint;
const SHARE_ENDPOINT = environment.shareEndpoint;

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

  getBlobFiles(): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_FILES_BLOB_ENDPOINT, { headers: headers})
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  downloadData(name: any): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_FILE_BLOB_ENDPOINT + name.id + '/', { headers: headers, responseType: ResponseContentType.Blob  })
    .map( response => {
      let blob:any = new Blob([response.blob()], { type: 'text/json; charset=utf-8' });
			saveAs(blob, name["name"]);
      return "ok"
    }).pipe(catchError(this.handleError));
  }

  // MARK: - Tools

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

  getTools(): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_TOOLS_BLOB_ENDPOINT, { headers: headers })
    .map(response => {
      return response.json();
    }).pipe(catchError(this.handleError));
  }

  deleteTool(name: string ) {
    let headers: Headers = this.createHeaders()
    return this.http
    .delete(API_URL + DELETE_TOOL_ENPOINT + name + '/', { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  // MARK: - Task

  loadParameters(toolName: string) {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_PARAMETERS_ENDPOINT + toolName + '/', { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  submitTask(definition: object) {
    let headers: Headers = this.createHeaders()
    return this.http.post(API_URL + SUBMIT_TASK_ENDPOINT, definition, { headers: headers })
    .map(response => {
      return response;
    }).pipe(catchError(this.handleError));
  }

  getResultsFiles(): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_RESULTS_BLOB_ENDPOINT, { headers: headers })
    .map(response => {
      return response['_body'];
    }).pipe(catchError(this.handleError));
  }

  getStatus(): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + STATUS_ENDPOINT, { headers: headers })
    .map(response => {
      return response['_body'];
    }).pipe(catchError(this.handleError));
  }

  // MARK: - Error Handling

  handleError(response: any) {
    switch (response.status) {
        case 401:
          Swal.fire("Invalid Permissions", "You do not have enought permissions", "error");
        default:
          Swal.fire("Server error", "Something went wrong", "error");
    }
    console.log(response.status)
    return throwError(response);
  }

  // MARK: - Sharing

  share(sharingData: object, email: string, permission: string): Observable<Response> {
    let headers: Headers = this.createHeaders()
    return this.http
    .post(API_URL + SHARE_ENDPOINT, {email: email, entity: sharingData, permission: permission}, { headers: headers })
    .map(response => {
      return response['_body'];
    }).pipe(catchError(this.handleError));
  }

}
