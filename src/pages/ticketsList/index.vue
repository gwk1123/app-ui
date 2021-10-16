<template>
  <div class="ticket-list">
    <div class="ticket-list-header">
      <div class="city-wrap fx-row fx-v-center fx-m-between">
        <div class="dep">{{ dep.name }}</div>
        <img :src="headIcon" />
        <div class="arr">{{ arr.name }}</div>
      </div>
      <div
        class="date-wrap"
        :class="{'fx-row': arrDate != '', 'fx-m-between': arrDate != ''}"
      >
        <div class="dep-date">出发时间：{{ depDate }}</div>
        <div
          class="arr-date"
          v-if="arrDate != ''"
        >返程时间：{{ arrDate }}</div>
      </div>
    </div>
    <div class="ticket-list-body">
        <div
          class="ticket-card"
          v-for="(item, index) in ticketList"
          :key="index"
          @click="goBook(item)"
        >
          <div class="ticket-card-body fx-row fx-v-center fx-m-between">
            <div class="ticket-time">
              <div class="time fx-row fx-v-center fx-m-between">
                <div>{{ item.depTime }}</div>
                <img :src="timeIcon" />
                <div>{{ item.arrTime }}</div>
              </div>
              <div class="airport fx-row">
                <div class="airport-dep">{{ item.depAirport }}</div>
                <div class="airport-arr">{{ item.arrAirport }}</div>
              </div>
            </div>
            <div class="ticket-price">￥{{ item.price }}</div>
          </div>
          <div class="ticket-card-footer">{{ item.flightNo }}</div>
        </div>
<!--      </template>-->
    </div>
  </div>
</template>

<script>
// 数据
import airport from '@/data/airport.js';
import ticketMock from "@/data/ticket.js";
// 图片
import oneway_icon from '@/assets/iconImages/oneway.png';
import return_icon from "@/assets/iconImages/return.png";
import timeArrow from "@/assets/iconImages/timeArrow.png";

import { search } from '@/data/webApp';

export default {
  name: 'zsc',
  data() {
    return {
      dep: {
        name: '',
        code: ''
      },
      arr: {
        name: '',
        code: ''
      },
      headIcon: oneway_icon,
      timeIcon: timeArrow,
      depDate: '',
      arrDate: '',
      fromDate: '',
      retDate: '',
      isDomestic: true,
      depTimeList: [],
      arrTimeList: [],
      ticketList: [],
      isRt: '',
    };
  },
  created() {
    let query = this.$route.query;
    let { dep, arr, depDate, arrDate, isRt, uid , fromDate , retDate } = query;
    isRt = isRt == 0 ? true : false;
    this.uid = uid;
    this.isRt = isRt;
    if (isRt) {
      this.headIcon = return_icon;
    }
    this.depDate = depDate;
    this.arrDate = arrDate;
    this.queryCity(dep, 0);
    this.queryCity(arr, 1);
    let q= JSON.stringify(query);
    this.createList(q);
  },
  methods: {
    // 查询出发地 目的地 详细信息
    queryCity(city, type) {
      let matchedArray = airport.domestic.filter(item => {
        if (item.code == city) return item;
      });
      if (matchedArray.length == 0) {
        matchedArray = airport.international.filter(item => {
          if (item.code == city) return item;
        });
        this.isDomestic = false;
      }
      /**
       * type = 0 =>出发地
       * type = 1 => 目的地
       */
      if (type === 0) {
        this.dep = matchedArray[0];
      } else {
        this.arr = matchedArray[0];
      }
      this.queryAirport(matchedArray, type);
    },
    // 查询匹配的机场名
    queryAirport(arr, type) {
      let airportArray = arr[0].al;
      airportArray = airportArray.map(item => {
        if (item.n.indexOf("国际机场") > 0) {
          let airport = item.n.split("国际机场");
          return airport[0];
        } else {
          let airport = item.n.split("机场");
          return airport[0];
        }
      });
      if (type === 0) {
        this.depAirport = airportArray;
      } else {
        this.arrAirport = airportArray;
      }
    },
    //  生成航班列表
    createList(query) {
      search(query).then(response => {
        if (response.data.status === 0) {
          let routings = response.data.routings;
          let arrList = [];
          for (let i = 0; i < routings.length; i++) {
            let routing = routings[i];
            let flightNo = routings[i].fromSegments[0].flightNumber;
            let depTime = routings[i].fromSegments[0].depTime.substr(-4);
            let arrTime = routings[i].fromSegments[routings[i].fromSegments.length - 1].arrTime.substr(-4);
            let price = routings[i].adultPrice + routings[i].adultTax;
            let depAirport = routings[i].fromSegments[0].depAirport;
            let arrAirport = routings[i].fromSegments[routings[i].fromSegments.length - 1].arrAirport;
            arrList[i] = {
              routing: routing,
              flightNo: flightNo,
              depTime: depTime,
              arrTime: arrTime,
              price: price,
              depAirport: depAirport,
              arrAirport: arrAirport
            }
          }
          this.ticketList = arrList;
        }
      });
    },
    goBook(item) {
      this.$router.push({
        path: '/book',
        query: {
          uid: this.uid,
          dep: this.dep.code,
          arr: this.arr.code,
          depTime: item.depTime,
          arrTime: item.arrTime,
          price: item.price,
          depDate: this.depDate,
          flightNo: item.flightNo,
          routing: JSON.stringify(item.routing),
          isRt: this.isRt,
          // from: this.ticketList
        }
      })
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '../../stylus/common.styl';
.ticket-list {
  padding: 8 * $px;
  &-header {
    padding: 16 * $px;
    background: #9acefe;
    border-radius: 8 * $px;
    box-shadow: 0 0 8 * $px #ecf6ff;
    .city-wrap {
      color: #fff;
      font-size: 20 * $px;
      font-weight: 600;
      img {
        width: 90 * $px;
        height: 35 * $px;
        display: block;
      }
    }
    .date-wrap {
      .dep-date, .arr-date {
        padding: 5 * $px;
        background: #ecf6ff;
        margin-top: 8 * $px;
        color: #888;
        border-radius: 5 * $px;
        text-align: center;
      }
    }
  }
  &-body {
    padding: 10 * $px 0;
    .ticket-card {
      margin-bottom: 12 * $px;
      background: linear-gradient(#fff, #ecf6ff);
      padding: 8 * $px 12 * $px;
      border-radius: 8 * $px;
      box-shadow: 0 0 4 * $px #eee;
      &-body {
        .ticket-time {
          width: 195 * $px;
          .time {
            font-size: 24 * $px;
            font-weight: 500;
            text-align: center;
            height: 30 * $px;
            line-height: 30 * $px;
            img {
              display: block;
              width: 40 * $px;
              height: 6 * $px;
            }
          }
          .airport {
            color: #888;
            font-size: 14 * $px;
            &-dep {
              width: 97 * $px;
              text-align: start;
            }
            &-arr {
              width: 97 * $px;
              text-align: end;
            }
          }
        }
        .ticket-price {
          font-size: 24 * $px;
          color: #ff7200;
        }
      }
      &-footer {
        text-align: start;
        margin-top: 8 * $px;
        color: #4ac29a;
      }
    }
  }
}
</style>

