# H16 installation

Распакуйте архив поверх H15-проекта. Архив не содержит `.env`, `.env.test`,
`.git`, `node_modules` и `dist`.

```powershell
yarn install --frozen-lockfile
yarn build
yarn typecheck:h16
yarn test:h16
```

API prefix: `/hometask_16/api`.

Новые каталоги и файлы создаются архивом автоматически. Не выполняйте
`New-Item -ItemType File -Force` после копирования: эта команда очищает файлы.
