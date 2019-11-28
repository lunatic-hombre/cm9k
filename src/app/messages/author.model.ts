const ID_KEY = 'USER_ID';

function fakeId(length) {
  let result             = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function getMyId() {
  const myId = localStorage.getItem(ID_KEY);
  if (!myId) {
    const newId = fakeId(8);
    localStorage.setItem(ID_KEY, newId);
    return newId;
  } else {
    return myId;
  }
}

export class User {
  id: string;
  name: string;
  avatar: string;
  constructor(id: string, name: string, avatar: string) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
  }
}
