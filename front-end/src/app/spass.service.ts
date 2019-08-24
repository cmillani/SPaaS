import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs/Observable';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/map';

const API_URL = environment.apiUrl;
const CREATE_USER_ENDPOINT = environment.createUserEndpoint;
const AUTH_USER_ENDPOINT = environment.authUserEndpoint;
const UPLOAD_DATA_ENDPOINT = environment.uploadDataEndpoint;
const GET_FILES_BLOB_ENDPOINT = environment.getFilesEndpoint;
const UPLOAD_TOOL_ENDPOINT = environment.uploadToolsEndpoint;
const GET_TOOLS_BLOB_ENDPOINT = environment.getToolsEndpoint;
const DELETE_TOOL_ENPOINT = environment.deleteToolsEnpoint;
const DELETE_DATA_ENDPOINT = environment.deleteDataEndpoint;
const GET_PARAMETERS_ENDPOINT = environment.getParametersEndpoint;
const SUBMIT_TASK_ENDPOINT = environment.submitTaskEndpoint;
const GET_RESULTS_BLOB_ENDPOINT = environment.getResultsBlobEndpoints;
const STATUS_ENDPOINT = environment.statusEndpoint;

@Injectable()
export class SpassService {
  public currentMail: string;

  constructor(private http: Http, public oidcSecurityService: OidcSecurityService) {
  }

  private createHeaders(): Headers {
    var headers: Headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const token = this.oidcSecurityService.getToken();
    if (token !== '') {
      const tokenValue = 'Bearer ' + token;
      headers.set('Authorization', tokenValue);
    }

    return headers
  }

  uploadData(fileToUpload: File, nameOfFile: string): Observable<object> {
    let headers: Headers = this.createHeaders()
    const formData: FormData = new FormData();
    formData.append(nameOfFile, fileToUpload, fileToUpload.name);

    return this.http
    .post(API_URL + UPLOAD_DATA_ENDPOINT, formData, { headers: headers })
    .map(response => {
      return response;
    });
  }

  getBlobFiles(): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_FILES_BLOB_ENDPOINT, { headers: headers })
    .map(response => {
      return response['_body'];
    });
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
    });
  }

  getTools(): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_TOOLS_BLOB_ENDPOINT)
    .map(response => {
      return response['_body'];
    });
  }

  deleteTool(name: string ) {
    let headers: Headers = this.createHeaders()
    return this.http
    .delete(API_URL + DELETE_TOOL_ENPOINT + name + '/', { headers: headers })
    .map(response => {
      return response;
    });
  }

  deleteData(name: string) {
    let headers: Headers = this.createHeaders()
    return this.http
    .delete(API_URL + DELETE_DATA_ENDPOINT + name + '/', { headers: headers })
    .map(response => {
      return response;
    });
  }

  loadParameters(toolName: string) {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_PARAMETERS_ENDPOINT + toolName + '/', { headers: headers })
    .map(response => {
      return response;
    });
  }

  submitTask(definition: object) {
    let headers: Headers = this.createHeaders()
    return this.http.post(API_URL + SUBMIT_TASK_ENDPOINT, definition, { headers: headers })
    .map(response => {
      console.log(response);
      return response;
    });
  }

  getResultsFiles(): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + GET_RESULTS_BLOB_ENDPOINT, { headers: headers })
    .map(response => {
      return response['_body'];
    });
  }

  getStatus(): Observable<string> {
    let headers: Headers = this.createHeaders()
    return this.http
    .get(API_URL + STATUS_ENDPOINT, { headers: headers })
    .map(response => {
      return response['_body'];
    });
  }

}
