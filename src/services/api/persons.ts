import { request } from "./client";

export const getPersons = () =>
  request("/analitika/persons");

export const createPerson = (data: any) =>
  request("/analitika/persons", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updatePerson = (id: number, data: any) =>
  request(`/analitika/persons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletePerson = (id: number) =>
  request(`/analitika/persons/${id}`, {
    method: "DELETE",
  });

export const personsApi = {
  getPersons,
  createPerson,
  updatePerson,
  deletePerson,
};

