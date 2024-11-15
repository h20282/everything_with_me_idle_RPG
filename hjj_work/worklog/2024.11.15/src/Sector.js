var sector = new Object();

var effector = new Object();

///////////////////////////////////////////
//ZNE SECTOR
///////////////////////////////////////////
function Sector() {
  this.id = 0;
  this.group = [0];
  this.data = {};
  this.active = false;
  this.onEnter = function () {};
  this.onLeave = function () {};
  this.onStay = function () {};
  this.onMove = function () {};
  this.onScout = function () {};
}

function addtosector(sector, loc) {
  sector.group.push(loc.id);
  loc.sector.push(sector);
}

function inSector(sector) {
  for (let a in global.current_l.sector)
    if (global.current_l.sector[a].id === sector.id) return true;
}

sector.home = new Sector();
sector.home.id = 1;
sector.home.inside = true;
sector.home.ddata = {};
sector.home.onEnter = function () {
  let fire = findbyid(furn, furniture.frplc.id);
  for (let f in furn) activatef(furn[f]);
  if (this.data.smkp > 0) {
    dom.d_lctt.innerHTML +=
      '<span style="color:grey;font-size:1.2em">&nbsp煙<span>';
    let re = time.minute - this.data.smkt;
    this.data.smkp -= re;
  }
};

sector.home.data = {
  scoutm: 100,
  scout: 0,
  scoutf: false,
  gets: [false],
  gotmod: 0,
  smkp: 0,
  ctlt: [],
};
sector.home.scout = [
  {
    c: 0.1,
    cond: () => {
      if (sector.home.data.ctlt.length != 0) return true;
    },
    f: () => {
      let i = select(sector.home.data.ctlt);
      msg(
        select([
          "Your cat found something for you",
          "Another one of your cat's gifts",
          "Something was lying in the corner of the room. Probably cat's",
          "Your cat dropped something before you",
        ]),
        "lime"
      );
      let k = itemgroup[((i + 1) / 10000) << 0];
      for (let v in k) if (k[v].id === i) giveItem(k[v]);
      sector.home.data.ctlt.splice(sector.home.data.ctlt.indexOf(i), 1);
    },
    exp: 2,
  },
];
sector.home.onScout = function () {
  scoutGeneric(this);
};

sector.home.onMove = function () {
  if (this.data.smkp > 0) {
    dom.d_lctt.innerHTML +=
      '<span style="color:grey;font-size:1.2em">&nbsp煙<span>';
  }
};

sector.home.onLeave = function () {
  global.stat.athmec = 0;
  if (effect.fplc.active === true) removeEff(effect.fplc);
  this.data.smkt = time.minute;
  for (let f in furn) deactivatef(furn[f]);
};

sector.home.onStay = function () {
  if (this.data.smkp > 0) {
    if (effect.smoke.active) effect.smoke.duration = 26;
    else giveEff(you, effect.smoke, 26);
    if (--this.data.smkp <= 0) smove(global.current_l);
  }
  if (global.flags.catget) giveSkExp(skl.pet, you.mods.petxp);
  global.stat.athme += global.timescale;
  global.stat.athmec += global.timescale;
  for (let x in global.nethmchk) global.nethmchk[x]();
  let fire = findbyid(furn, furniture.frplc.id);

  if (effect.fplc.active === false && fire.data.fuel > 0)
    giveEff(you, effect.fplc, fire.data.fuel);
  if (fire.data.fuel > 0) {
    if (effect.fplc.active === false) giveEff(you, effect.fplc, 2);
    let afire = findbyid(furn, furniture.fwdpile.id);
    if (afire && fire.data.fuel <= 2 && afire.data.fuel > 0) {
      fire.data.fuel += 30;
      afire.data.fuel--;
    }
  }
};

sector.vcent = new Sector();
sector.vcent.id = 2;
sector.vcent.onStay = function () {
  if (
    random() < 0.03 &&
    !isWeather(weather.sstorm) &&
    !isWeather(weather.heavyrain) &&
    !isWeather(weather.thunder) &&
    getHour() > 8 &&
    getHour() < 20
  ) {
    if (!global.text.vlg1)
      global.text.vlg1 = [
        '"♪La, laaaah, la, la-la. Lah, la-la,la la....♪"',
        '"Eat flowers evil-doer!♪"',
        '"Oh my! Such pretty flowers♪"',
        '"Can I tag along? I won\'t be a bother♪"',
      ];
    if (!global.text.vlg1s)
      global.text.vlg1s = [
        '"Let\'s build a snowman!♪"',
        '"Yey, snow!♪"',
        '"Everything is so white and beautiful♪"',
        "A snowball lands on you. Hey!",
      ];
    msg(
      getSeason() === 4 ? select(global.text.vlg1s) : select(global.text.vlg1),
      "yellow"
    );
  }
};

sector.forest1 = new Sector();
sector.forest1.id = 3;
sector.forest1.data = { scoutm: 7000, scout: 0, scoutf: false };
sector.forest1.onStay = function () {
  if (!this.data.scoutf) {
    if (this.data.scout <= this.data.scoutm) {
      if (global.flags.btl || act.scout.active === true) {
        this.data.scout += 0.1;
        giveSkExp(skl.tpgrf, 0.001);
      }
    } else {
      msg("Area Explored!", "lime");
      this.data.scoutf = true;
      giveExp(7000, true, true, true);
    }
  }
};

sector.cata1 = new Sector();
sector.cata1.id = 4;
sector.cata1.inside = true;
sector.cata1.effectors = [{ e: effector.dark }];
sector.cata1.data = { scoutm: 11000, scout: 0, scoutf: false };

sector.vmain1 = new Sector();
sector.vmain1.id = 5; /*
sector.vmain1.data={scoutm:400,scout:0,scoutf:false,gets:[false],gotmod:0}
sector.vmain1.scout=[
  {c:.11,f:()=>{msg(select(['You notice a coin on the ground!','You pick a coin from under the counter','You snatch a coin while no one is looking']),'lime');giveItem(select([item.cp,item.cn,item.cq,item.cd]));sector.vmain1.data.gets[0]=true},exp:5},
  {c:.05,f:()=>{msg(select(['You notice a coin on the ground!','You pick a coin from under the counter','You snatch a coin while no one is looking']),'lime');giveItem(select([item.cp,item.cn,item.cq,item.cd]));sector.vmain1.data.gets[1]=true},exp:5},
]
sector.vmain1.onScout=function(){scoutGeneric(this)}*/

export { sector, addtosector };
