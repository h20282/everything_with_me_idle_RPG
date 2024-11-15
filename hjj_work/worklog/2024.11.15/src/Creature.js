var creature = new Object();

let item = new Object();
let wpn = new Object();
let eqp = new Object();
let acc = new Object();

function Eqp() {
  this.name = "nothing";
  this.desc = "";
  this.str = 0;
  this.agl = 0;
  this.int = 0;
  this.spd = 0;
  this.dp = 15;
  this.dpmax = 15;
  this.eff = [];
  this.data = { dscv: false };
  this.cls = [0, 0, 0]; // edge, pierce, blunt
  //this.ccls=[0,0,0];
  this.aff = [0, 0, 0, 0, 0, 0, 0]; //p, a, e, f, w, l, d
  //this.caff = [0,0,0,0,0,0,0];
  //this.maff=[0,0,0,0,0,0,0];
  //this.cmaff=[0,0,0,0,0,0,0];
  this.atype = 0;
  this.ctype = 0;
  this.wtype = 0; // un, srd, axe, knf, spr, hmr, stff
  this.atkmode = 1;
  this.rar = 1;
  this.type = 2;
  this.amount = 1;
  this.stype = 2;
  this.slot = 0;
  this.id = 10000;
  this.important = false;
  this.new = false;
  this.cond = function () {
    return true;
  };
  this.onGet = function () {};
  this.oneq = function () {};
  this.onuneq = function () {};
  this.use = function () {
    equip(this);
  };
}
eqp.dummy = new Eqp();

///////////////////////////////////////////
//CRT
///////////////////////////////////////////

function Creature() {
  this.name = "Nothing";
  this.desc = "Empty space";
  this.type = 3; //h,b,u,e,p,d
  this.id = 0;
  this.lvl = 1;
  this.exp = 1;
  this.stat_p = [1, 1, 1, 1]; //hp, str, agl, int
  this.eqp = [eqp.dummy, eqp.dummy];
  this.cls = [0, 0, 0];
  this.aff = [0, 0, 0, 0, 0, 0, 0]; //phy air eth fir wtr lgt drk
  this.res = {
    poison: 1,
    burn: 1,
    frost: 1,
    paralize: 1,
    blind: 1,
    sleep: 1,
    curse: 1,
    death: 1,
    bleed: 1,
    ph: 1,
    venom: 1,
    fpoison: 1,
  };
  this.atype = 0;
  this.ctype = 0;
  this.atkmode = 1;
  this.hp = this.hp_r = this.hpmax = 17;
  this.str =
    this.str_r =
    this.agl =
    this.agl_r =
    this.int =
    this.int_r =
    this.spd =
    this.spd_r =
      1;
  this.stra = this.agla = this.inta = this.spda = this.hpa = 0;
  this.strm = this.intm = this.spdm = this.aglm = this.hpm = 1;
  this.crt = 0.008;
  this.dmlt = 1;
  this.rnk = 0;
  this.pts = 1;
  this.eva = 0;
  this.data = { lstdmg: 0, oneshot: true };
  this.stat_r = function () {
    this.stre = this.inte = this.agle = this.spde = this.sate = this.hpe = 1;
    for (let idx in this.eff) this.eff[idx].mods();
    this.str = (this.str_r + this.stra) * this.strm * this.stre;
    this.str_d = this.str;
    this.int = (this.int_r + this.inta) * this.intm * this.inte;
    this.int_d = this.int;
    this.agl = (this.agl_r + this.agla) * this.aglm * this.agle;
    this.agl_d = this.agl;
    this.spd = (this.spd_r + this.spda) * this.spdm * this.spde;
    this.spd_d = this.spd;
    this.hpmax = Math.ceil((this.hp_r + this.hpa) * this.hpm * this.hpe);
    this.dmlt = 1;
    for (let idx in this.eff) {
      if (this.eff[idx].type === 2) {
        this.eff[idx].un();
        this.eff[idx].use(this.eff[idx].y, this.eff[idx].z);
      }
    }
    update_m();
    if (this.hp > this.hpmax) this.hp = this.hpmax;
  };
  this.alive = true;
  this.eff = [];
  this.drop = [];
  this.onDeath = function (killer) {
    callback.onDeath.fire(this, killer);
    this.hp = 0;
    this.alive = false;
    let tt = 0;
    for (let obj in global.bestiary) {
      if (global.bestiary[obj].id === this.id) {
        global.bestiary[obj].kills++;
        break;
      }
      if (++tt === global.bestiary.length)
        global.bestiary.push({ id: this.id, kills: 1 });
    }
    global.stat.akills++;
    global.stat.pts += this.pts;
    if (you.eqp[0].id !== 10000)
      you.eqp[0].data.kills
        ? you.eqp[0].data.kills++
        : (you.eqp[0].data.kills = 1);
    if (this.type !== 2 && this.type !== 4) global.spirits++;
    else if (this.type === 4) global.spirits--;
    if (global.flags.m_blh === false) msg(this.name + " died ", "burlywood");
    global.flags.civil = true;
    global.flags.btl = false;
    let df = 1;
    let ld = this.lvl - you.lvl;
    if (ld < 0)
      df = Math.sqrt(Math.abs(ld)) + Math.abs(ld) * 0.1 * Math.abs(ld);
    giveExp(this.exp + (((this.exp * this.lvl) / 10) << 0) / df);
    dropC(this);
    global.s_l = 0;
    if (you.mods.enmondren > 0)
      if (random() < you.mods.enmondren) {
        let aam =
          1 +
          rand(this.lvl << 0, (this.lvl / 4) << 0) **
            ((1 + this.rnk / 5) << 0) *
            you.mods.enmondrts;
        giveWealth(rand((aam * 0.5) << 0 || 1, (aam * 1.5) << 0 || 1));
      }
    if (--global.current_z.size > 0) area_init(global.current_z);
    else {
      if (global.current_z.size <= -1) area_init(global.current_z);
      else {
        msg("Area cleared", "orange");
        global.current_z.onEnd();
        global.flags.civil = true;
        global.flags.btl = false;
      }
    }
    if (global.flags.to_pause === true) global.flags.btl = false;
    wpndiestt(killer, this);
    if (this.blood) global.stat.bloodt += this.blood;
    for (let a in checksd) checksd[a].f(this, checksd[a].o);
    for (let x in global.achchk[1]) global.achchk[1][x](killer);
    dom.d5_1_1m.update();
    dom.d7m.update();
    kill(this);
  };
  this.onDeathE = function () {
    giveSkExp(skl.war, (this.rnk * 2 - 1) * (1 + this.lvl * 0.05) * 0.1);
  };
  this.battle_ai = function (x, y, z) {
    /*me = this.data;
    if(!me.lasthp) me.lasthp=this.hp;
    me.cdmg = me.lasthp-this.hp;
    me.avgdmg = (me.cdmg+me.lstdmg)/2;
    me.lasthp=this.hp; me.lstdmg=me.cdmg;
    if(this.hp-me.avgdmg<=0) {msg('too scary, running away'); global.flags.btlinterrupt=true;}
    */ return attack(x, y);
  };
}

creature.default = new Creature();

creature.bat = new Creature();
creature.bat.name = "Bat";
creature.bat.id = 101;
creature.bat.desc = "Aggressive little bats living in the dark";
creature.bat.type = 1;
creature.bat.exp = 8;
creature.bat.hp_r = 39;
creature.bat.blood = 0.0852;
creature.bat.stat_p = [0.5, 1, 1.5, 0.5];
creature.bat.aff = [-5, 25, -5, -5, 10, -5, 5];
creature.bat.cls = [-4, -7, -3];
creature.bat.eqp[0].aff = [0, 12, -10, 0, 0, -5, 5];
creature.bat.eqp[0].cls = [1, 1, 0];
creature.bat.atype = 1;
creature.bat.ctype = 1;
creature.bat.str_r = 2;
creature.bat.agl_r = 10;
creature.bat.spd_r = 2;
creature.bat.drop = [
  { item: item.sbone, chance: 0.1 },
  { item: item.appl, chance: 0.06 },
];
creature.bat.rnk = 3;
creature.bat.pts = 6;

creature.cbat = new Creature();
creature.cbat.id = 109;
creature.cbat.name = "Cave bat";
creature.cbat.desc =
  "Large, agile bats that swooop down to strike from the air";
creature.cbat.drop = [];

creature.stirge = new Creature();
creature.stirge.id = 110;
creature.stirge.name = "Stirge";
creature.stirge.desc =
  "Giant vampire bats rumored to drain a victim's life in a single blow";
creature.stirge.drop = [];

creature.spd1 = new Creature();
creature.spd1.name = "Attic spider";
creature.spd1.id = 104;
creature.spd1.desc = "Small docile spiders who live in damp and dark places";
creature.spd1.type = 1;
creature.spd1.exp = 8;
creature.spd1.hp_r = 26;
creature.spd1.stat_p = [0.6, 1.1, 1.6, 1];
creature.spd1.aff = [2, 5, 10, -35, 10, -5, 15];
creature.spd1.cls = [4, 6, -6];
creature.spd1.eqp[0].aff = [3, -5, 5, 0, 0, -5, 5];
creature.spd1.eqp[0].cls = [2, 1, 1];
creature.spd1.str_r = 3;
creature.spd1.agl_r = 8;
creature.spd1.spd_r = 2;
creature.spd1.rnk = 3;
creature.spd1.pts = 5;
creature.spd1.drop = [
  { item: item.ltcc, chance: 0.01 },
  { item: item.thrdnl, chance: 0.1 },
];
creature.spd1.battle_ai = function (x, y, z) {
  if (random() <= 0.3) return attack(x, y, abl.pbite, 3);
  return attack(x, y);
};

creature.tdummy = new Creature();
creature.tdummy.id = 103;
creature.tdummy.name = "Training dummy";
creature.tdummy.desc = "He's made of fabric";
creature.tdummy.drop = [
  {
    item: wpn.knf1,
    chance: 0.01,
    cond: () => {
      return you.lvl <= 20;
    },
  },
  {
    item: eqp.brc,
    chance: 0.03,
    cond: () => {
      return you.lvl <= 20;
    },
  },
  { item: item.hrb1, chance: 0.02 },
];
creature.tdummy.aff = [0, 0, 15, -25, -5, -666, 666];
creature.tdummy.stat_p = [0.1, 0.5, 0.4, 0.2];
creature.tdummy.ctype = 2;
creature.tdummy.int_r = 0;
creature.tdummy.rnk = 1;
creature.tdummy.battle_ai = function (x, y, z) {
  if (random() <= 0.001) return attack(x, y, abl.rstab);
  return attack(x, y);
};
creature.tdummy.onDeathE = function () {};

creature.sdummy = new Creature();
creature.sdummy.id = 102;
creature.sdummy.name = "Straw dummy";
creature.sdummy.desc = "He's made of straw";
creature.sdummy.drop = [
  { item: item.sstraw, chance: 0.085 },
  { item: item.hrb1, chance: 0.02 },
];
creature.sdummy.aff = [0, 0, 15, -25, -5, -666, 666];
creature.sdummy.stat_p = [0.25, 0.6, 0.3, 0.2];
creature.sdummy.ctype = 2;
creature.sdummy.int_r = 0;
creature.sdummy.rnk = 1;
creature.sdummy.battle_ai = function (x, y, z) {
  if (random() <= 0.001) return attack(x, y, abl.rstab);
  return attack(x, y);
};
creature.sdummy.onDeathE = function () {};

creature.wdummy = new Creature();
creature.wdummy.id = 112;
creature.wdummy.name = "Wooden dummy";
creature.wdummy.desc = "He's made of wood";
creature.wdummy.stat_p = [0.4, 0.8, 0.12, 0.2];
creature.wdummy.aff = [0, 0, 15, -30, 20, -666, 666];
creature.wdummy.cls = [-1, 2, 4];
creature.wdummy.str_r = 3;
creature.wdummy.ctype = 2;
creature.wdummy.rnk = 1;
creature.wdummy.drop = [
  {
    item: eqp.pnt,
    chance: 0.008,
    cond: () => {
      return you.lvl <= 20;
    },
  },
  {
    item: eqp.vst,
    chance: 0.007,
    cond: () => {
      return you.lvl <= 20;
    },
  },
  {
    item: eqp.bnd,
    chance: 0.01,
    cond: () => {
      return you.lvl <= 20;
    },
  },
  { item: item.wdc, chance: 0.03 },
  {
    item: wpn.wsrd2,
    chance: 0.002,
    cond: () => {
      return you.lvl <= 20;
    },
  },
];
creature.wdummy.battle_ai = function (x, y, z) {
  if (random() <= 0.001) return attack(x, y, abl.rstab);
  return attack(x, y);
};
creature.wdummy.onDeathE = function () {};

creature.puppet = new Creature();
creature.puppet.id = 105;
creature.puppet.name = "Puppet";
creature.puppet.desc = "Animated doll with agile movements";
creature.puppet.drop = [];
creature.puppet.battle_ai = function (x, y, z) {};

creature.bpuppet = new Creature();
creature.bpuppet.id = 106;
creature.bpuppet.name = "Battle Puppet";
creature.bpuppet.desc = "Animated doll with martial ability";
creature.bpuppet.drop = [];
creature.bpuppet.battle_ai = function (x, y, z) {};

creature.doll = new Creature();
creature.doll.id = 107;
creature.doll.name = "Doll";
creature.doll.desc = "Child's toy possessed by an evil spirit";
creature.doll.drop = [];
creature.doll.battle_ai = function (x, y, z) {};

creature.ndoll = new Creature();
creature.ndoll.id = 108;
creature.ndoll.name = "Necro doll";
creature.ndoll.desc = "Evil Dolls used in dark rituals";
creature.ndoll.drop = [];
creature.ndoll.battle_ai = function (x, y, z) {};

creature.cdoll = new Creature();
creature.cdoll.id = 111;
creature.cdoll.name = "Quicksilver";
creature.cdoll.desc =
  "Dolls possessed by the souls of children who lost their lives to war or illness";
creature.cdoll.drop = [];
creature.cdoll.battle_ai = function (x, y, z) {};

creature.zomb1 = new Creature();
creature.zomb1.id = 113;
creature.zomb1.name = "Zombie";
creature.zomb1.desc =
  "Once the inhabitants of the surface, zombies emerge from the Dark to attack the living";

creature.mumy = new Creature();
creature.mumy.id = 114;
creature.mumy.name = "Mummy";
creature.mumy.desc = "Ancient corpses infused with the power of Dark";

creature.ghl = new Creature();
creature.ghl.id = 115;
creature.ghl.name = "Ghoul";
creature.ghl.desc =
  "Ghouls lurk in the Catacombs, longing for human flesh. Attacking their heads proves effective";

creature.ght = new Creature();
creature.ght.id = 116;
creature.ght.name = "Ghast";
creature.ght.desc = "The living dead, given power by demons of the Underworld";

creature.zmbf = new Creature();
creature.zmbf.id = 117;
creature.zmbf.name = "Zombie Fighter";
creature.zmbf.desc =
  "Corpses of common soldiers, brought back to life through the Dark's taint";

creature.zmbk = new Creature();
creature.zmbk.id = 118;
creature.zmbk.name = "Zombie Knight";
creature.zmbk.desc =
  "Zombies of the Knights of the Cross, still in possession of potent martial skills";

creature.zmbm = new Creature();
creature.zmbm.id = 119;
creature.zmbm.name = "Zombie Mage";
creature.zmbm.desc =
  "Zombies of Dark mages, who employ powerful offensive magic";

creature.skl = new Creature();
creature.skl.name = "Skeleton";
creature.skl.id = 120;
creature.skl.desc =
  "Skeletal remains of zombie corpses. They lurk in darkness to attack the living";
creature.skl.type = 2;
creature.skl.exp = 15;
creature.skl.hp_r = 132;
creature.skl.stat_p = [1.3, 1.15, 1.05, 0.1];
creature.skl.aff = [12, 20, -4, -11, 31, -33, 51];
creature.skl.cls = [0, 9, -16];
creature.skl.eqp[0].aff = [8, 20, -4, -11, 31, -33, 51];
creature.skl.eqp[0].cls = [2, 5, 5];
creature.skl.ctype = 1;
creature.skl.str_r = 17;
creature.skl.agl_r = 19;
creature.skl.spd_r = 2;
creature.skl.drop = [];
creature.skl.rnk = 7;
creature.skl.pts = 17;

creature.slm1 = new Creature();
creature.slm1.name = "Blue Slime";
creature.slm1.id = 121;
creature.slm1.desc =
  "Lesser slimes, devoid of any senses. They survive by absorbing debris from the ground";
creature.slm1.type = 1;
creature.slm1.exp = 3;
creature.slm1.hp_r = 65;
creature.slm1.stat_p = [0.7, 0.8, 1.5, 0.3];
creature.slm1.aff = [5, 5, 15, -20, -15, 25, 34];
creature.slm1.cls = [5, 5, 20];
creature.slm1.eqp[0].aff = [2, 5, 0, -2, 4, 0, 0];
creature.slm1.eqp[0].cls = [1, 1, 1];
creature.slm1.ctype = 2;
creature.slm1.str_r = 2;
creature.slm1.agl_r = 5;
creature.slm1.eva = 6;
creature.slm1.spd_r = 1;
creature.slm1.drop = [
  { item: item.watr, chance: 0.01 },
  { item: item.slm, chance: 0.03 },
  { item: item.jll, chance: 0.01 },
];
creature.slm1.rnk = 2;
creature.slm1.pts = 3;

creature.slm2 = new Creature();
creature.slm2.name = "Green Slime";
creature.slm2.id = 122;
creature.slm2.desc = "Small forest slimes. They hide in leaves and grass";
creature.slm2.type = 1;
creature.slm2.exp = 4;
creature.slm2.hp_r = 70;
creature.slm2.stat_p = [0.75, 0.85, 1.5, 0.3];
creature.slm2.aff = [5, 5, 15, -20, -15, 25, 34];
creature.slm2.cls = [4, 4, 22];
creature.slm2.eqp[0].aff = [2, 12, 5, -12, 6, 0, 0];
creature.slm2.eqp[0].cls = [2, 2, 2];
creature.slm2.ctype = 1;
creature.slm2.str_r = 3;
creature.slm2.agl_r = 5;
creature.slm2.eva = 6;
creature.slm2.spd_r = 1;
creature.slm2.drop = [
  { item: item.watr, chance: 0.01 },
  { item: item.slm, chance: 0.04 },
  { item: item.jll, chance: 0.01 },
  { item: acc.jln2, chance: 0.0005 },
];
creature.slm2.rnk = 2;
creature.slm2.pts = 3;

creature.rbt1 = new Creature();
creature.rbt1.name = "Wild Rabbit";
creature.rbt1.id = 123;
creature.rbt1.desc =
  "Docile rabbits, often found in plains and woods. They're difficult to catch";
creature.rbt1.type = 1;
creature.rbt1.exp = 5;
creature.rbt1.stat_p = [1, 0.9, 2, 0.3];
creature.rbt1.aff = [6, 15, 15, -10, 16, 33, 2];
creature.rbt1.cls = [4, -2, 5];
creature.rbt1.eqp[0].aff = [5, 6, 6, 0, 2, 0, 0];
creature.rbt1.eqp[0].cls = [2, 3, 1];
creature.rbt1.ctype = 1;
creature.rbt1.hp_r = 55;
creature.rbt1.blood = 0.108;
creature.rbt1.str_r = 2;
creature.rbt1.agl_r = 10;
creature.rbt1.eva = 40;
creature.rbt1.spd_r = 2;
creature.rbt1.drop = [
  { item: item.sbone, chance: 0.1 },
  { item: item.rwmt1, chance: 0.06 },
  { item: item.crrt, chance: 0.04 },
  { item: acc.rfot, chance: 0.00004 },
];
creature.rbt1.rnk = 2;
creature.rbt1.pts = 4;

creature.slm3 = new Creature();
creature.slm3.name = "Cyan Slime";
creature.slm3.id = 124;
creature.slm3.desc =
  "Brightly colored slime. It looks like it can perfectly reflect the sky";
creature.slm3.type = 1;
creature.slm3.exp = 8;
creature.slm3.hp_r = 120;
creature.slm3.stat_p = [1.2, 1.2, 2.9, 0.8];
creature.slm3.aff = [15, 5, 15, -10, -5, 55, 34];
creature.slm3.cls = [9, 9, 24];
creature.slm3.eqp[0].aff = [4, 6, 7, -12, 6, 0, 0];
creature.slm3.eqp[0].cls = [4, 4, 4];
creature.slm3.ctype = 1;
creature.slm3.atype = 1;
creature.slm3.str_r = 5;
creature.slm3.agl_r = 8;
creature.slm3.eva = 15;
creature.slm3.spd_r = 2;
creature.slm3.drop = [
  { item: item.watr, chance: 0.03 },
  { item: item.slm, chance: 0.05 },
  { item: item.jll, chance: 0.02 },
];
creature.slm3.rnk = 3;
creature.slm3.pts = 4;

creature.slm4 = new Creature();
creature.slm4.name = "Clear Slime";
creature.slm4.id = 125;
creature.slm4.desc =
  "Weird transparent slime, bearing no distinct color. They can hide anywhere and are very difficult to notice";
creature.slm4.type = 1;
creature.slm4.exp = 10;
creature.slm4.hp_r = 95;
creature.slm4.stat_p = [1.24, 1.23, 2.97, 0.82];
creature.slm4.aff = [15, 5, 15, -10, -5, 55, 34];
creature.slm4.cls = [12, 12, 28];
creature.slm4.eqp[0].aff = [4, 9, 7, -12, 12, 0, 0];
creature.slm4.eqp[0].cls = [6, 5, 4];
creature.slm4.ctype = 2;
creature.slm4.atype = 4;
creature.slm4.str_r = 9;
creature.slm4.agl_r = 9;
creature.slm4.eva = 20;
creature.slm4.spd_r = 2;
creature.slm4.drop = [
  { item: item.watr, chance: 0.035 },
  { item: item.slm, chance: 0.02 },
  { item: item.jll, chance: 0.06 },
];
creature.slm4.rnk = 3;
creature.slm4.pts = 5;

creature.kksh = new Creature(); //u
creature.kksh.name = "Scarecrow";
creature.kksh.id = 126;
creature.kksh.desc =
  "Once protector of fields, this figure has turned to evil by the influence of Dark. It hangs still in ambush, waiting for unsuspecting passersby";
creature.kksh.exp = 5;
creature.kksh.hp_r = 100;
creature.kksh.stat_p = [1.1, 1.2, 2.9, 0.8];
creature.kksh.aff = [15, 5, 15, -10, -5, 55, 34];
creature.kksh.cls = [9, 9, 35];
creature.kksh.eqp[0].aff = [4, 12, 7, -12, 6, 0, 0];
creature.kksh.eqp[0].cls = [5, 5, 5];
creature.kksh.ctype = 1;
creature.kksh.atype = 1;
creature.kksh.str_r = 5;
creature.kksh.agl_r = 13;
creature.kksh.spd_r = 2;
creature.kksh.drop = [
  { item: item.watr, chance: 0.03 },
  { item: item.slm, chance: 0.06 },
  { item: item.jll, chance: 0.02 },
];
creature.kksh.rnk = 10;

creature.golem1 = new Creature();
creature.golem1.name = "Straw Golem";
creature.golem1.id = 127;
creature.golem1.desc =
  "Big golem composed of straw. These golems are brittle and weak, their main purpose is to assist newbies in training";
creature.golem1.exp = 50;
creature.golem1.hp_r = 500;
creature.golem1.stat_p = [0.05, 0.2, 0.2, 0.2];
creature.golem1.aff = [10, 8, 5, -60, -5, 15, 14];
creature.golem1.cls = [10, 15, 10];
creature.golem1.eqp[0].aff = [9, 5, 25, 6, 6, 2, 13];
creature.golem1.eqp[0].cls = [2, 2, 10];
creature.golem1.ctype = 2;
creature.golem1.str_r = 15;
creature.golem1.agl_r = 30;
creature.golem1.spd_r = 3;
creature.golem1.drop = [
  { item: item.sstraw, chance: 1, min: 13, max: 25 },
  { item: item.lsrd, chance: 1 },
];
creature.golem1.rnk = 4;
creature.golem1.un = true;
creature.golem1.pts = 200;

creature.golem2 = new Creature();
creature.golem2.name = "Reinforced Straw Golem";
creature.golem2.id = 128;
creature.golem2.desc =
  "This golem's joints have been binded by the rope, giving it sturdier and more stable frame";
creature.golem2.exp = 60;
creature.golem2.hp_r = 700;
creature.golem2.stat_p = [0.06, 0.25, 0.2, 0.25];
creature.golem2.aff = [11, 8, 5, -60, -5, 15, 14];
creature.golem2.cls = [11, 16, 11];
creature.golem2.eqp[0].aff = [10, 5, 25, 6, 6, 2, 13];
creature.golem2.eqp[0].cls = [3, 3, 11];
creature.golem2.ctype = 2;
creature.golem2.str_r = 18;
creature.golem2.agl_r = 35;
creature.golem2.spd_r = 3;
creature.golem2.rnk = 4;
creature.golem2.un = true;
creature.golem2.drop = [
  { item: item.sstraw, chance: 1, min: 13, max: 25 },
  { item: item.lsrd, chance: 1, min: 2, max: 2 },
  { item: item.rope, chance: 0.1 },
];
creature.golem2.pts = 400;

creature.golem3 = new Creature();
creature.golem3.name = "Paper Golem";
creature.golem3.id = 129;
creature.golem3.desc =
  "Slim golem made of paper-like material. While not as tough as other training golems, it has a light body which allows it to move faster";
creature.golem3.exp = 80;
creature.golem3.hp_r = 400;
creature.golem3.stat_p = [0.06, 0.3, 0.3, 0.3];
creature.golem3.aff = [11, 8, 5, -60, -5, 15, 14];
creature.golem3.cls = [10, 20, 14];
creature.golem3.eqp[0].aff = [10, 5, 25, 6, 6, 2, 13];
creature.golem3.eqp[0].cls = [3, 3, 14];
creature.golem3.ctype = 2;
creature.golem3.str_r = 21;
creature.golem3.agl_r = 70;
creature.golem3.spd_r = 4;
creature.golem3.rnk = 4;
creature.golem3.un = true;
creature.golem3.drop = [
  { item: item.lsrd, chance: 1, min: 4, max: 4 },
  { item: item.bhd, chance: 0.5, min: 1, max: 4 },
];
creature.golem3.pts = 500;

creature.golem4 = new Creature();
creature.golem4.name = "Attack Golem";
creature.golem4.id = 130;
creature.golem4.desc =
  "Golem with implanted martial prowess. Somewhat similar to a trained militant, they pose a dangerous threat to any unprepared opponent";
creature.golem4.exp = 120;
creature.golem4.hp_r = 730;
creature.golem4.stat_p = [0.06, 0.3, 0.3, 0.3];
creature.golem4.aff = [19, 8, 5, -60, -5, 15, 14];
creature.golem4.cls = [20, 25, 18];
creature.golem4.eqp[0].aff = [11, 5, 25, 6, 6, 2, 13];
creature.golem4.eqp[0].cls = [3, 3, 13];
creature.golem4.ctype = 2;
creature.golem4.str_r = 25;
creature.golem4.agl_r = 50;
creature.golem4.spd_r = 4;
creature.golem4.rnk = 5;
creature.golem4.un = true;
creature.golem4.pts = 800;
creature.golem4.drop = [{ item: item.lsstn, chance: 1 }];
creature.golem4.battle_ai = function (x, y, z) {
  if (random() <= 0.2) return attack(x, y, abl.bash);
  return attack(x, y);
};

creature.ngtmr1 = new Creature();
creature.ngtmr1.name = "Nightmare";
creature.ngtmr1.id = 131;
creature.ngtmr1.desc = "Manifestation of your fears";
creature.ngtmr1.exp = 1;
creature.ngtmr1.hp_r = 100000000;
creature.ngtmr1.stat_p = [0, 0, 0, 0];
creature.ngtmr1.cls = [9999, 9999, 9999];
creature.ngtmr1.str_r = 1;
creature.ngtmr1.agl_r = 1;
creature.ngtmr1.rnk = 0;
creature.ngtmr1.battle_ai = function () {
  return false;
};

creature.lrck = new Creature();
creature.lrck.name = "Locked Rock";
creature.lrck.id = 132;
creature.lrck.desc =
  "A rock shaped monster found in caves and dungeons. It has a habit of closing of paths by mimicking a wall, but it's fighting prowess is close to zero.";
creature.lrck.exp = 123;
creature.lrck.hp_r = 9000;
creature.lrck.stat_p = [1.5, 1.2, 1, 1];
creature.lrck.cls = [90, 120, 60];
creature.lrck.str_r = 90;
creature.lrck.agl_r = 1;
creature.lrck.rnk = 11;
creature.lrck.battle_ai = function () {
  return false;
};

creature.lsprt = new Creature(); //u
creature.lsprt.name = "Lamp Spirit";
creature.lsprt.id = 133;
creature.lsprt.desc =
  "Small fire sprites that manifest inside oil lamps located in mines and other places with low human activity. While not sinister by nature, they enjoy playing pranks on people";
creature.lsprt.exp = 5;
creature.lsprt.hp_r = 100;
creature.lsprt.stat_p = [1.1, 1.2, 2.9, 0.8];
creature.lsprt.aff = [15, 5, 15, -10, -5, 55, 34];
creature.lsprt.cls = [9, 9, 35];
creature.lsprt.eqp[0].aff = [4, 12, 7, -12, 6, 0, 0];
creature.lsprt.eqp[0].cls = [5, 5, 5];
creature.lsprt.ctype = 1;
creature.lsprt.atype = 1;
creature.lsprt.str_r = 5;
creature.lsprt.agl_r = 13;
creature.lsprt.spd_r = 2;
creature.lsprt.drop = [
  { item: item.watr, chance: 0.03 },
  { item: item.slm, chance: 0.06 },
  { item: item.jll, chance: 0.02 },
];
creature.lsprt.rnk = 10;

creature.dcrps1 = new Creature();
creature.dcrps1.id = 134;
creature.dcrps1.name = "Disaster Corpse";
creature.dcrps1.desc =
  "Undead bodies manifested purely by death ki. They appear in ancient battlefields or other areas with extremely heavy concentration of dark ki. These corpses share countless memories of residue souls";

creature.unsctn = new Creature();
creature.unsctn.id = 135;
creature.unsctn.name = "Unchanging Skeleton";
creature.unsctn.desc =
  "People that neither die nor dissolve, active in the world but don't have minds or memories. They won't hurt people other than pulling pranks and causing trouble, but would go frenzy if exposed to death ki for too long";

creature.wolf1 = new Creature();
creature.wolf1.name = "Weakened Wolf";
creature.wolf1.id = 136;
creature.wolf1.desc =
  "Wolves affected by a disease or other negative influences. While not nearly as dangerous as its healthy counterpart, even in such a low state they pose danger to those who aren't careful"; //'Predatorous inhabitants of forests with a proud character. They stalk their prey and hunt in packs';
creature.wolf1.type = 1;
creature.wolf1.exp = 15;
creature.wolf1.hp_r = 400;
creature.wolf1.stat_p = [1.3, 1.15, 1.35, 0.9];
creature.wolf1.aff = [22, 20, -4, -11, 31, -33, 51];
creature.wolf1.cls = [36, 32, 45];
creature.wolf1.eqp[0].aff = [12, 20, -4, -11, 31, -33, 51];
creature.wolf1.eqp[0].cls = [8, 9, 8];
creature.wolf1.ctype = 1;
creature.wolf1.str_r = 20;
creature.wolf1.agl_r = 20;
creature.wolf1.int_r = 10;
creature.wolf1.spd_r = 3;
creature.wolf1.eva = 25;
creature.wolf1.drop = [
  { item: item.sbone, chance: 0.15 },
  { item: item.rwmt1, chance: 0.06 },
  { item: item.wfng, chance: 0.005 },
];
creature.wolf1.rnk = 4;
creature.wolf1.blood = 0.986;
creature.wolf1.pts = 9;
creature.wolf1.battle_ai = function (x, y, z) {
  if (random() <= 0.3) return attack(x, y, abl.bite);
  else if (random() <= 0.1) return attack(x, y, abl.scratch);
  return attack(x, y);
};

creature.slm5 = new Creature();
creature.slm5.name = "Blue Slime";
creature.slm5.id = 137;
creature.slm5.desc =
  "Slime of a very deep darkblue hue, which looks shiny under the light and almost completely dark in the shade";
creature.slm5.type = 1;
creature.slm5.exp = 12;
creature.slm5.hp_r = 220;
creature.slm5.stat_p = [0.5, 1.1, 2.97, 0.6];
creature.slm5.aff = [19, 15, 15, 3, -5, 55, 34];
creature.slm5.cls = [23, 23, 23];
creature.slm5.eqp[0].aff = [4, 9, 7, -12, 12, 0, 0];
creature.slm5.eqp[0].cls = [7, 7, 7];
creature.slm5.ctype = 2;
creature.slm5.atype = 4;
creature.slm5.str_r = 8;
creature.slm5.agl_r = 9;
creature.slm5.eva = 22;
creature.slm5.spd_r = 2;
creature.slm5.drop = [
  { item: item.watr, chance: 0.085 },
  { item: item.slm, chance: 0.03 },
  { item: item.jll, chance: 0.07 },
  { item: acc.jln3, chance: 0.0005 },
];
creature.slm5.rnk = 3;
creature.slm5.pts = 5;
creature.slm5.battle_ai = function (x, y, z) {
  if (random() <= 0.15) return attack(x, y, abl.bash);
  return attack(x, y);
};
export { creature };
