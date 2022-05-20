import { ApiConfig, RolePermissionInterface, ApiListType } from "../interfaces";

export class ApiHelper {

  static apiConfigs: ApiConfig[] = [];
  static isAuthenticated = false;

  static getConfig(keyName: string) {
    let result: ApiConfig;
    this.apiConfigs.forEach(config => { if (config.keyName === keyName) result = config });
    //if (result === null) throw new Error("Unconfigured API: " + keyName);
    return result;
  }

  static setDefaultPermissions(jwt: string) {
    this.apiConfigs.forEach(config => {
      config.jwt = jwt;
      config.permisssions = [];
    });
    this.isAuthenticated = true;
  }

  static setPermissions(keyName: string, jwt: string, permissions: RolePermissionInterface[]) {
    this.apiConfigs.forEach(config => {
      if (config.keyName === keyName) {
        config.jwt = jwt;
        config.permisssions = permissions;
      }
    });
    this.isAuthenticated = true;
  }

  static clearPermissions() {
    this.apiConfigs.forEach(config => { config.jwt = ""; config.permisssions = []; });
    this.isAuthenticated = false;
  }

  static async get(path: string, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    const requestOptions = { method: "GET", headers: { Authorization: "Bearer " + config.jwt } };
    try {
      const response = await fetch(config.url + path, requestOptions);
      if (!response.ok) this.throwApiError(response);
      else return response.json();
    } catch (e) {
      console.log(e)
      throw (e);
    }
  }

  static async getAnonymous(path: string, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    const requestOptions = { method: "GET" };

    try {
      const response = await fetch(config.url + path, requestOptions);
      if (!response.ok) this.throwApiError(response);
      else return response.json();
    } catch (e) {
      console.log(e)
      throw (e);
    }
  }

  static async post(path: string, data: any[] | {}, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    const requestOptions = {
      method: "POST",
      headers: { Authorization: "Bearer " + config.jwt, "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    try {
      const response = await fetch(config.url + path, requestOptions);
      if (!response.ok) this.throwApiError(response);
      else return response.json();
    } catch (e) {
      console.log(e)
      throw (e);
    }
  }

  static async patch(path: string, data: any[] | {}, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    const requestOptions = {
      method: "PATCH",
      headers: { Authorization: "Bearer " + config.jwt, "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    try {
      const response = await fetch(config.url + path, requestOptions);
      console.log("patch resp", response)
      if (!response.ok) this.throwApiError(response);
      return response.json();
    } catch (e) {
      console.log(e)
      throw (e);
    }
  }

  static async delete(path: string, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    const requestOptions = {
      method: "DELETE",
      headers: { Authorization: "Bearer " + config.jwt }
    };
    try {
      const response = await fetch(config.url + path, requestOptions);
      if (!response.ok) this.throwApiError(response);
    } catch (e) {
      console.log(e)
      throw (e);
    }
  }

  static async postAnonymous(path: string, data: any[] | {}, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    try {
      const response = await fetch(config.url + path, requestOptions);
      if (!response.ok) this.throwApiError(response);
      else return response.json();
    } catch (e) {
      console.log(e)
      throw (e);
    }
  }

  private static async throwApiError(response: Response) {
    let msg = response.statusText;
    try { msg = (await response.json()).errors[0]; } catch { }
    throw new Error(msg);
  }

}
