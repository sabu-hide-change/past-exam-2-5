// npm install lucide-react recharts firebase

import React, { useState, useEffect } from 'react';
import { Check, X, Home, ChevronRight, List, Bookmark, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteField } from 'firebase/firestore';

// --------------------------------------------------
// Firebase Configuration & Initialization
// --------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const APP_ID = "QuizApp_001_CostAccounting";

// --------------------------------------------------
// Quiz Data (Parsed from DOCX)
// --------------------------------------------------
const quizData = [
  {
    id: 1,
    title: "個別原価計算",
    year: "令和3年 第8問",
    question: (
      <div>
        <p className="mb-4">ある製品の販売予算が以下のとおり編成されており、第3四半期(Q3)の実際販売量が1,600個、実際販売価格が98,000円であった。予算実績差異を販売数量差異と販売価格差異に分割する場合、最も適切な組み合わせを下記の解答群から選べ。</p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2">Q1</th>
                <th className="border border-gray-300 p-2">Q2</th>
                <th className="border border-gray-300 p-2">Q3</th>
                <th className="border border-gray-300 p-2">Q4</th>
                <th className="border border-gray-300 p-2">合計</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">販売量(個)</td>
                <td className="border border-gray-300 p-2 text-right">1,200</td>
                <td className="border border-gray-300 p-2 text-right">1,400</td>
                <td className="border border-gray-300 p-2 text-right text-blue-600 font-bold">1,500</td>
                <td className="border border-gray-300 p-2 text-right">1,400</td>
                <td className="border border-gray-300 p-2 text-right">5,500</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">売上高(万円)</td>
                <td className="border border-gray-300 p-2 text-right">12,000</td>
                <td className="border border-gray-300 p-2 text-right">14,000</td>
                <td className="border border-gray-300 p-2 text-right text-blue-600 font-bold">15,000</td>
                <td className="border border-gray-300 p-2 text-right">14,000</td>
                <td className="border border-gray-300 p-2 text-right">55,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    choices: [
      "販売数量差異1,000万円(不利差異)と販売価格差異300万円(不利差異)",
      "販売数量差異1,000万円(不利差異)と販売価格差異320万円(不利差異)",
      "販売数量差異1,000万円(有利差異)と販売価格差異300万円(不利差異)",
      "販売数量差異1,000万円(有利差異)と販売価格差異320万円(不利差異)"
    ],
    answerIndex: 3,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：エ</strong></p>
        <p>「原価差異」は標準より実際が小さいと有利ですが、「販売差異」は標準より実際が大きい方が有利（売上が大きい）となる点に注意が必要です。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>予算販売単価:</strong> 15,000万円 ÷ 1,500個 ＝ 10万円/個</li>
          <li><strong>販売数量差異:</strong> (実際1,600個 － 予算1,500個) × 予算単価10万円 ＝ +1,000万円 (有利差異)</li>
          <li><strong>販売価格差異:</strong> (実際9.8万円 － 予算10万円) × 実際数量1,600個 ＝ ▲320万円 (不利差異)</li>
        </ul>
        <div className="mt-4 p-4 border border-gray-400 bg-white text-sm relative">
          <div className="flex border-b border-gray-400">
            <div className="w-1/2 p-2 bg-orange-100 border-r border-gray-400">
              <div className="font-bold">販売価格差異</div>
              <div>(9.8 - 10)万円 × 1,600個 = ▲320万円</div>
            </div>
            <div className="w-1/2 p-2 flex items-center justify-center text-gray-500">※実際価格 9.8万円/個</div>
          </div>
          <div className="flex">
            <div className="w-1/3 p-2 border-r border-gray-400 flex items-center justify-center">販売予算</div>
            <div className="w-2/3 p-2 bg-orange-100">
              <div className="font-bold">販売数量差異</div>
              <div>(1,600 - 1,500)個 × 10万円 = +1,000万円</div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>予算1,500個 (10万円/個)</span>
            <span>実際1,600個</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "原価計算",
    year: "平成27年 第6問",
    question: (
      <p>原価計算に関する記述として最も適切なものはどれか。</p>
    ),
    choices: [
      "原価計算における総原価とは、製造原価を意味する。",
      "原価計算は、財務諸表を作成する目的のためだけに行う。",
      "原価計算は、製造業にのみ必要とされる計算手続きである。",
      "材料費・労務費・経費の分類は、財務会計における費用の発生を基礎とする分類である。"
    ],
    answerIndex: 3,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：エ</strong></p>
        <p>各選択肢の解説は以下の通りです：</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>ア：不適切。</strong>総原価は、製造原価に「販売費及び一般管理費」を加えたものです。</li>
          <li><strong>イ：不適切。</strong>財務諸表の作成だけでなく、利益管理や価格決定の目的のためにも行われます。</li>
          <li><strong>ウ：不適切。</strong>小売業や卸売業など、製造業以外でも必要とされる計算手続きです。</li>
          <li><strong>エ：適切。</strong>材料費（原材料・部品）、労務費（労働力）、経費（それ以外）の分類は、財務会計の費用発生を基礎とする分類です。</li>
        </ul>
      </div>
    )
  },
  {
    id: 3,
    title: "原価計算（直接労務費）",
    year: "令和2年 第10問",
    question: (
      <div>
        <p className="mb-4">以下の資料に基づき、当月の直接労務費の金額として、最も適切なものを下記の解答群から選べ。なお、予定賃率を用いて賃金消費額を計算している。</p>
        <div className="bg-gray-50 p-4 border border-gray-300 rounded mb-4">
          <p className="font-semibold">【資料】</p>
          <ul className="list-disc pl-5">
            <li>本年度の直接工の予定就業時間は12,000時間、直接工賃金予算額は14,400,000円である。</li>
            <li>当月の直接工の直接作業時間は1,100時間、間接作業時間は100時間、手待時間は200時間であった。</li>
          </ul>
        </div>
      </div>
    ),
    choices: [
      "1,200,000円",
      "1,320,000円",
      "1,440,000円",
      "1,680,000円"
    ],
    answerIndex: 1,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：イ</strong></p>
        <p>まず、1時間当たりの予定賃率を計算します。</p>
        <p>予定賃率 ＝ 14,400,000円 ÷ 12,000時間 ＝ <strong>1,200円/時間</strong></p>
        <p>直接労務費は「直接作業時間」のみを対象とします。（間接作業時間や手待時間は「間接労務費」となるため除外します）</p>
        <p>直接労務費 ＝ 1,200円/時間 × 1,100時間 ＝ <strong>1,320,000円</strong></p>
      </div>
    )
  },
  {
    id: 4,
    title: "個別原価計算（製造指図書）",
    year: "令和3年 第7問",
    question: (
      <div>
        <p className="mb-4">以下の資料は、工場の2020年8月分のデータである。このとき、製造指図書#11の製造原価として、最も適切なものを下記の解答群から選べ。</p>
        <div className="bg-gray-50 p-4 border border-gray-300 rounded mb-4 text-sm">
          <p className="font-semibold mb-2">(1)直接費</p>
          <table className="min-w-full border-collapse border border-gray-300 mb-4 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2">製造指図書</th>
                <th className="border border-gray-300 p-2">材料消費量</th>
                <th className="border border-gray-300 p-2">材料単価</th>
                <th className="border border-gray-300 p-2">直接作業</th>
                <th className="border border-gray-300 p-2">時間賃率</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2 text-center">#11</td><td className="border border-gray-300 p-2 text-right">50kg</td><td className="border border-gray-300 p-2 text-right">@2,000円/kg</td><td className="border border-gray-300 p-2 text-right">100時間</td><td className="border border-gray-300 p-2 text-right">1,200円/時</td></tr>
              <tr><td className="border border-gray-300 p-2 text-center">#12</td><td className="border border-gray-300 p-2 text-right">60kg</td><td className="border border-gray-300 p-2 text-right">@2,500円/kg</td><td className="border border-gray-300 p-2 text-right">110時間</td><td className="border border-gray-300 p-2 text-right">1,200円/時</td></tr>
              <tr><td className="border border-gray-300 p-2 text-center">#13</td><td className="border border-gray-300 p-2 text-right">50kg</td><td className="border border-gray-300 p-2 text-right">@1,500円/kg</td><td className="border border-gray-300 p-2 text-right">90時間</td><td className="border border-gray-300 p-2 text-right">1,200円/時</td></tr>
            </tbody>
          </table>
          <p className="font-semibold mb-2">(2)間接費</p>
          <ul className="list-disc pl-5">
            <li>製造間接費実際発生額: 150,000円</li>
            <li>製造間接費は直接作業時間を配賦基準として各製品に配賦する。</li>
          </ul>
        </div>
      </div>
    ),
    choices: [
      "220,000円",
      "228,000円",
      "270,000円",
      "337,000円"
    ],
    answerIndex: 2,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：ウ</strong></p>
        <p>個別原価計算では、直接費を「直接賦課」し、間接費を「配賦」します。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>①直接材料費:</strong> 50kg × 2,000円 ＝ 100,000円</li>
          <li><strong>②直接労務費:</strong> 100時間 × 1,200円 ＝ 120,000円</li>
        </ul>
        <p className="mt-2"><strong>③間接費の配賦:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>全直接作業時間 ＝ 100 ＋ 110 ＋ 90 ＝ 300時間</li>
          <li>配賦率 ＝ 150,000円 ÷ 300時間 ＝ 500円/時間</li>
          <li>#11への配賦 ＝ 500円 × 100時間 ＝ 50,000円</li>
        </ul>
        <p className="font-bold text-blue-700">合計(製造原価) ＝ 100,000 ＋ 120,000 ＋ 50,000 ＝ 270,000円</p>
      </div>
    )
  },
  {
    id: 5,
    title: "総合原価計算（先入先出法）",
    year: "令和元年 第1問",
    question: (
      <div>
        <p className="mb-4">8月の商品Ａの取引は以下のとおりであった。8月の商品売買益として、最も適切なものを下記の解答群から選べ。なお、先入先出法を採用しているものとする。</p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border-collapse border border-gray-300 text-sm bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2">日付</th>
                <th className="border border-gray-300 p-2">摘要</th>
                <th className="border border-gray-300 p-2">数量</th>
                <th className="border border-gray-300 p-2">単価</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">8月1日</td><td className="border border-gray-300 p-2">前月繰越</td><td className="border border-gray-300 p-2 text-right">20個</td><td className="border border-gray-300 p-2 text-right">300円</td></tr>
              <tr><td className="border border-gray-300 p-2">2日</td><td className="border border-gray-300 p-2">仕入</td><td className="border border-gray-300 p-2 text-right">100個</td><td className="border border-gray-300 p-2 text-right">350円</td></tr>
              <tr><td className="border border-gray-300 p-2">5日</td><td className="border border-gray-300 p-2">仕入戻し</td><td className="border border-gray-300 p-2 text-right">10個</td><td className="border border-gray-300 p-2 text-right">350円</td></tr>
              <tr><td className="border border-gray-300 p-2">16日</td><td className="border border-gray-300 p-2">売上</td><td className="border border-gray-300 p-2 text-right">80個</td><td className="border border-gray-300 p-2 text-right">600円</td></tr>
              <tr><td className="border border-gray-300 p-2">19日</td><td className="border border-gray-300 p-2">売上戻り</td><td className="border border-gray-300 p-2 text-right">10個</td><td className="border border-gray-300 p-2 text-right">600円</td></tr>
              <tr><td className="border border-gray-300 p-2">31日</td><td className="border border-gray-300 p-2">次月繰越</td><td className="border border-gray-300 p-2 text-right">40個</td><td className="border border-gray-300 p-2"></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    choices: [
      "4,500円",
      "10,500円",
      "18,500円",
      "24,500円"
    ],
    answerIndex: 2,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：ウ</strong></p>
        <p>先入先出法（FIFO）に基づく原価と売上の計算を行います。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>実質売上数量:</strong> 売上80個 － 売上戻り10個 ＝ 70個</li>
          <li><strong>純売上高:</strong> 70個 × 600円 ＝ 42,000円</li>
        </ul>
        <p className="mt-2"><strong>売上原価の計算（先入先出法）:</strong></p>
        <p>販売した70個のうち、まず「前月繰越」から引当、残りを「当月仕入」から引き当てます。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>前月繰越分: 20個 × 300円 ＝ 6,000円</li>
          <li>当月仕入分(残り50個): 50個 × 350円 ＝ 17,500円</li>
          <li>商品原価合計 ＝ 6,000円 ＋ 17,500円 ＝ 23,500円</li>
        </ul>
        <p className="font-bold text-blue-700 mt-2">商品売買益 ＝ 売上高(42,000円) － 商品原価(23,500円) ＝ 18,500円</p>
      </div>
    )
  },
  {
    id: 6,
    title: "平均法",
    year: "令和5年 第10問",
    question: (
      <div>
        <p className="mb-4">当工場の以下の資料に基づき、平均法による月末仕掛品原価として、最も適切なものを下記の解答群から選べ。なお、材料は工程の始点ですべて投入されており、減損は工程の終点で発生している。</p>
        <div className="bg-gray-50 p-4 border border-gray-300 rounded mb-4 text-sm">
          <p className="font-semibold mb-2">(1) 当月の生産量</p>
          <ul className="list-disc pl-5 mb-4">
            <li>月初仕掛品: 200kg (50%)</li>
            <li>当月投入: 400kg</li>
            <li>合計: 600kg</li>
            <li>正常減損: 100kg (100%)</li>
            <li>月末仕掛品: 200kg (50%)</li>
            <li>当月完成品: 300kg</li>
            <li className="list-none text-gray-500 text-xs">※カッコ内は加工進捗度</li>
          </ul>
          <p className="font-semibold mb-2">(2) 当月の原価</p>
          <table className="min-w-full border-collapse border border-gray-300 mb-2 bg-white text-right">
            <thead className="bg-gray-100">
              <tr><th className="border border-gray-300 p-2"></th><th className="border border-gray-300 p-2">直接材料費</th><th className="border border-gray-300 p-2">加工費</th></tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2 text-left">月初仕掛品</td><td className="border border-gray-300 p-2">30,000円</td><td className="border border-gray-300 p-2">18,000円</td></tr>
              <tr><td className="border border-gray-300 p-2 text-left">当月投入</td><td className="border border-gray-300 p-2">120,000円</td><td className="border border-gray-300 p-2">84,000円</td></tr>
              <tr className="font-bold"><td className="border border-gray-300 p-2 text-left">合計</td><td className="border border-gray-300 p-2">150,000円</td><td className="border border-gray-300 p-2">102,000円</td></tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-600">※月末仕掛品原価の計算は度外視法によるものとする。</p>
        </div>
      </div>
    ),
    choices: [
      "70,400円",
      "81,000円",
      "85,500円",
      "108,000円"
    ],
    answerIndex: 0,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：ア</strong></p>
        <p>平均法に基づき、月末仕掛品の原価を計算します。正常減損は度外視法（両者に負担）を適用します。</p>
        <div className="bg-blue-50 p-3 rounded">
          <p className="font-bold">① 直接材料費（始点投入なので進捗度は無関係）</p>
          <ul className="list-disc pl-5 text-sm">
            <li>総数量 ＝ 完成品300 ＋ 減損100 ＋ 月末200 ＝ 600kg</li>
            <li>平均単価 ＝ (30,000 ＋ 120,000) ÷ 600 ＝ 250円/kg</li>
            <li>月末直接材料費 ＝ 250円 × 200kg ＝ <strong>50,000円</strong></li>
          </ul>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="font-bold">② 加工費（進捗度を加味した換算量）</p>
          <ul className="list-disc pl-5 text-sm">
            <li>月初(100kg), 完成(300kg), 減損(終点発生のため100%＝100kg), 月末(200kg×50%＝100kg)</li>
            <li>総換算量 ＝ 300 ＋ 100 ＋ 100 ＝ 500kg (※当月投入ではなく総量で割るのが平均法)</li>
            <li>平均単価 ＝ (18,000 ＋ 84,000) ÷ 500 ＝ 204円/kg</li>
            <li>月末加工費 ＝ 204円 × 100kg ＝ <strong>20,400円</strong></li>
          </ul>
        </div>
        <p className="font-bold text-blue-700">月末仕掛品原価 ＝ 50,000円 ＋ 20,400円 ＝ 70,400円</p>
      </div>
    )
  },
  {
    id: 7,
    title: "材料数量差異",
    year: "平成25年 第10問",
    question: (
      <div>
        <p className="mb-4">標準原価計算を実施しているA社の当月に関する以下のデータに基づき、材料数量差異として最も適切なものを、下記の解答群から選べ。なお、材料は工程の始点で投入される。</p>
        <div className="bg-gray-50 p-4 border border-gray-300 rounded mb-4 text-sm">
          <p className="font-semibold mb-1">【直接材料費の原価標準データ】</p>
          <p>300円/kg × 3kg ＝ 900円</p>
          <p className="font-semibold mb-1 mt-3">【当月の生産関連データ】</p>
          <ul className="list-disc pl-5">
            <li>当月材料消費量: 3,100kg</li>
            <li>材料消費価格: 310円/kg</li>
            <li>月初仕掛品: 200単位</li>
            <li>当月完成品: 900単位</li>
            <li>月末仕掛品: 300単位</li>
          </ul>
        </div>
      </div>
    ),
    choices: [
      "不利差異 30,000円",
      "不利差異 31,000円",
      "不利差異 61,000円",
      "不利差異 120,000円"
    ],
    answerIndex: 0,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：ア</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>当月投入量:</strong> 当月完成900 ＋ 月末仕掛品300 － 月初仕掛品200 ＝ 1,000単位<br/>(材料は始点投入のため、進捗度は加味しません)</li>
          <li><strong>標準消費量:</strong> 1,000単位 × 3kg ＝ 3,000kg</li>
          <li><strong>材料数量差異:</strong> 標準単価 × (標準消費量 － 実際消費量)<br/>
            ＝ 300円/kg × (3,000kg － 3,100kg) ＝ ▲30,000円<br/>
            実際消費量が標準より多いため、<strong>不利差異 30,000円</strong>となります。
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 8,
    title: "作業時間差異",
    year: "平成29年 第9問",
    question: (
      <div>
        <p className="mb-4">標準原価計算を採用しているB工場の以下の資料に基づき、作業時間差異として、最も適切なものを下記の解答群から選べ。</p>
        <div className="bg-gray-50 p-4 border border-gray-300 rounded mb-4 text-sm">
          <p className="font-semibold">(1) 原価標準（抜粋）</p>
          <p className="ml-4 mb-2">直接労務費: 300円/時間 × 6時間 ＝ 1,800円</p>
          
          <p className="font-semibold">(2) 当月の生産量</p>
          <ul className="list-disc pl-8 mb-2">
            <li>月初仕掛品: 40個（加工進捗度50％）</li>
            <li>当月投入: 120個</li>
            <li>当月完成品: 100個</li>
            <li>月末仕掛品: 60個（加工進捗度50％）</li>
          </ul>
          
          <p className="font-semibold">(3) 当月の実際直接労務費</p>
          <ul className="list-disc pl-8">
            <li>実際賃率: 310円/時間</li>
            <li>実際直接作業時間: 700時間</li>
          </ul>
        </div>
      </div>
    ),
    choices: [
      "不利差異：12,000円",
      "不利差異：12,400円",
      "有利差異：6,000円",
      "有利差異：6,200円"
    ],
    answerIndex: 0,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：ア</strong></p>
        <p>作業時間差異は「(標準作業時間 － 実際作業時間) × 標準賃率」で計算します。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>当月投入(換算量):</strong> 完成100 ＋ 月末(60×0.5) － 月初(40×0.5) ＝ 100 ＋ 30 － 20 ＝ 110個</li>
          <li><strong>標準作業時間:</strong> 110個 × 6時間 ＝ 660時間</li>
          <li><strong>作業時間差異:</strong> (660時間 － 700時間) × 300円/時間 ＝ ▲12,000円</li>
        </ul>
        <p>実際の作業時間（700時間）が標準（660時間）を上回っているため、<strong>不利差異</strong>となります。</p>
      </div>
    )
  },
  {
    id: 9,
    title: "公式法変動予算（シュラッター図）",
    year: "平成30年 第9問",
    question: (
      <div>
        <p className="mb-4">当社は製造間接費の予定配賦を行っている。製造間接費予算については公式法変動予算を採用している。以下の資料に基づき、製造間接費配賦差異のうち、予算差異の金額として、最も適切なものを下記の解答群から選べ。</p>
        <div className="bg-gray-50 p-4 border border-gray-300 rounded mb-4 text-sm">
          <p className="font-semibold mb-2">【資料】</p>
          <ul className="list-decimal pl-5">
            <li>月間の製造間接費予算: 基準操業度5,000時間、固定費150,000千円、変動費率20千円/時間</li>
            <li>当月の実際操業度: 4,000時間</li>
            <li>当月の製造間接費実際発生額: 245,000千円</li>
          </ul>
        </div>
      </div>
    ),
    choices: [
      "不利差異：15,000千円",
      "不利差異：30,000千円",
      "有利差異：15,000千円",
      "有利差異：30,000千円"
    ],
    answerIndex: 0,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：ア</strong></p>
        <p>公式法変動予算（シュラッター図）では、予算差異は「予算許容額」と「実際発生額」の差額で求めます。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>変動費予算額:</strong> 20千円/時間 × 実際操業度4,000時間 ＝ 80,000千円</li>
          <li><strong>予算許容額:</strong> 変動費予算(80,000) ＋ 固定費予算(150,000) ＝ 230,000千円</li>
          <li><strong>予算差異:</strong> 予算許容額230,000 － 実際発生額245,000 ＝ ▲15,000千円</li>
        </ul>
        <p>実際発生額が予算許容額を超えているため、<strong>不利差異</strong>となります。</p>
        
        <div className="mt-4 bg-white p-2 border border-gray-300 rounded h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={[0, 5000]} label={{ value: '操業度', position: 'bottom' }} />
              <YAxis domain={[0, 260000]} />
              <Tooltip />
              <Legend />
              {/* 予算許容額ライン */}
              <Line data={[ {x: 0, y: 150000}, {x: 5000, y: 250000} ]} dataKey="y" name="予算ライン" stroke="#8884d8" />
              {/* 固定費ライン */}
              <Line data={[ {x: 0, y: 150000}, {x: 5000, y: 150000} ]} dataKey="y" name="固定費" stroke="#82ca9d" />
              {/* 実際発生額ポイント */}
              <ReferenceDot x={4000} y={245000} r={5} fill="red" stroke="none" label={{ position: 'top', value: '実際 (245,000)' }} />
              <ReferenceDot x={4000} y={230000} r={5} fill="blue" stroke="none" label={{ position: 'bottom', value: '予算許容額 (230,000)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  },
  {
    id: 10,
    title: "意思決定に関係する原価",
    year: "平成25年 第16問",
    question: (
      <p>代替案の選択によって金額に差異が生じないコストであり、将来の意思決定に無関連な原価を表すものとして、最も適切なものはどれか。</p>
    ),
    choices: [
      "機会原価",
      "限界原価",
      "裁量可能原価",
      "埋没原価"
    ],
    answerIndex: 3,
    explanation: (
      <div className="space-y-3">
        <p><strong>正解：エ</strong></p>
        <p>各用語の意味は以下の通りです。</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>機会原価 (Opportunity Cost):</strong> ある選択をしたために失われた、他の選択肢での最大利益。意思決定に<strong>関連する</strong>。</li>
          <li><strong>限界原価:</strong> 生産量を1単位増やしたときに増加するコスト（変動費）。意思決定に<strong>関連する</strong>。</li>
          <li><strong>裁量可能原価:</strong> 経営者の判断で削減・増額をコントロールできる原価（広告費や研究開発費など）。意思決定に<strong>関連する</strong>。</li>
          <li><strong>埋没原価 (Sunk Cost):</strong> 過去の意思決定ですでに発生しており、今後のいかなる代替案を選んでも回収できないコスト。<strong>意思決定には無関連（考慮してはならない）</strong>。</li>
        </ul>
      </div>
    )
  }
];

// --------------------------------------------------
// Main App Component
// --------------------------------------------------
export default function App() {
  // Sync States
  const [syncWord, setSyncWord] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // App States
  const [screen, setScreen] = useState('login'); // 'login', 'resume', 'menu', 'quiz', 'history'
  const [history, setHistory] = useState({}); // { [id]: { isCorrect, updatedAt } }
  const [reviewFlags, setReviewFlags] = useState({}); // { [id]: boolean }
  const [progress, setProgress] = useState(null); // { index: number, mode: string }

  // Quiz Execution States
  const [currentList, setCurrentList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState('all');
  const [isAnswering, setIsAnswering] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState(null);

  // --------------------------------------------------
  // Firebase Data Fetch & Sync
  // --------------------------------------------------
  const syncDataToFirebase = async (updates) => {
    if (!syncWord) return;
    try {
      const docRef = doc(db, APP_ID, syncWord);
      await setDoc(docRef, updates, { merge: true });
      console.log('Firebase synced:', updates);
    } catch (error) {
      console.error('Firebase sync error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!syncWord.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await signInAnonymously(auth);
      const docRef = doc(db, APP_ID, syncWord);
      const docSnap = await getDoc(docRef);

      let fetchedHistory = {};
      let fetchedReviews = {};
      let fetchedProgress = null;

      if (docSnap.exists()) {
        const data = docSnap.data();
        fetchedHistory = data.history || {};
        fetchedReviews = data.reviewFlags || {};
        fetchedProgress = data.progress || null;
      }

      setHistory(fetchedHistory);
      setReviewFlags(fetchedReviews);
      setProgress(fetchedProgress);
      setIsLoggedIn(true);

      // Check for resumable progress
      if (fetchedProgress && typeof fetchedProgress.index === 'number') {
        setScreen('resume');
      } else {
        setScreen('menu');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('ログインに失敗しました。時間をおいて再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Navigation & Mode Selection
  // --------------------------------------------------
  const startQuiz = async (mode) => {
    let targetList = [];
    if (mode === 'all') {
      targetList = [...quizData];
    } else if (mode === 'wrong') {
      targetList = quizData.filter(q => history[q.id]?.isCorrect === false);
    } else if (mode === 'review') {
      targetList = quizData.filter(q => reviewFlags[q.id]);
    }

    if (targetList.length === 0) {
      alert('対象の問題がありません。');
      return;
    }

    setCurrentList(targetList);
    setCurrentMode(mode);
    setCurrentIndex(0);
    setIsAnswering(true);
    setSelectedChoice(null);
    setScreen('quiz');

    // Save starting progress
    const initProgress = { index: 0, mode: mode };
    setProgress(initProgress);
    await syncDataToFirebase({ progress: initProgress });
  };

  const resumeQuiz = async () => {
    if (!progress) return;
    const mode = progress.mode || 'all';
    let targetList = [];
    if (mode === 'all') {
      targetList = [...quizData];
    } else if (mode === 'wrong') {
      targetList = quizData.filter(q => history[q.id]?.isCorrect === false);
    } else if (mode === 'review') {
      targetList = quizData.filter(q => reviewFlags[q.id]);
    }

    // Safety fallback
    let safeIndex = progress.index;
    if (safeIndex >= targetList.length || safeIndex < 0) {
       safeIndex = 0;
    }

    if (targetList.length === 0) {
      await clearProgress();
      setScreen('menu');
      return;
    }

    setCurrentList(targetList);
    setCurrentMode(mode);
    setCurrentIndex(safeIndex);
    setIsAnswering(true);
    setSelectedChoice(null);
    setScreen('quiz');
  };

  const clearProgressAndStart = async () => {
    await clearProgress();
    setScreen('menu');
  };

  const clearProgress = async () => {
    setProgress(null);
    if (!syncWord) return;
    try {
      const docRef = doc(db, APP_ID, syncWord);
      await setDoc(docRef, { progress: deleteField() }, { merge: true });
      console.log('Progress cleared');
    } catch (e) {
      console.error(e);
    }
  };

  const endQuiz = async () => {
    await clearProgress();
    setScreen('menu');
  };

  // --------------------------------------------------
  // Quiz Interaction
  // --------------------------------------------------
  const handleAnswer = (choiceIdx) => {
    if (!isAnswering) return;
    const currentQ = currentList[currentIndex];
    const isCorrect = choiceIdx === currentQ.answerIndex;
    
    setSelectedChoice(choiceIdx);
    setIsAnswering(false);

    const updatedHistory = {
      ...history,
      [currentQ.id]: { isCorrect, updatedAt: Date.now() }
    };
    setHistory(updatedHistory);
    syncDataToFirebase({ history: updatedHistory });
  };

  const handleNext = async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < currentList.length) {
      setCurrentIndex(nextIndex);
      setIsAnswering(true);
      setSelectedChoice(null);
      
      // Update progress
      const newProgress = { index: nextIndex, mode: currentMode };
      setProgress(newProgress);
      await syncDataToFirebase({ progress: newProgress });
    } else {
      await endQuiz();
    }
  };

  const toggleReviewFlag = () => {
    const currentQ = currentList[currentIndex];
    const newFlagStatus = !reviewFlags[currentQ.id];
    const updatedFlags = { ...reviewFlags, [currentQ.id]: newFlagStatus };
    setReviewFlags(updatedFlags);
    syncDataToFirebase({ reviewFlags: updatedFlags });
  };

  // --------------------------------------------------
  // Screens (Components)
  // --------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center text-blue-700">原価計算 過去問演習</h1>
          <p className="text-sm text-gray-600 mb-4 text-center">データを同期するための合言葉（ユーザーID）を入力してください。</p>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: my-secret-word"
            value={syncWord}
            onChange={(e) => setSyncWord(e.target.value)}
            required
          />
          {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '読み込み中...' : 'スタート'}
          </button>
        </form>
      </div>
    );
  }

  if (screen === 'resume') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
         <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4">前回の続きから再開しますか？</h2>
            <p className="text-gray-600 mb-6 text-sm">
              モード: {progress.mode === 'all' ? 'すべての問題' : progress.mode === 'wrong' ? '前回不正解' : '要復習'}<br/>
              進行状況: {progress.index + 1}問目から
            </p>
            <div className="space-y-3">
              <button onClick={resumeQuiz} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                <Play size={18} /> 続きから再開する
              </button>
              <button onClick={clearProgressAndStart} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300">
                最初から始める
              </button>
            </div>
         </div>
      </div>
    );
  }

  if (screen === 'menu') {
    const wrongCount = quizData.filter(q => history[q.id]?.isCorrect === false).length;
    const reviewCount = quizData.filter(q => reviewFlags[q.id]).length;

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 p-4">
        <h1 className="text-2xl font-bold mb-8 text-blue-800">原価計算 過去問演習</h1>
        <div className="w-full max-w-md space-y-4">
          <button 
            onClick={() => startQuiz('all')}
            className="w-full bg-white p-4 rounded shadow hover:bg-gray-50 flex items-center justify-between border-l-4 border-blue-500"
          >
            <span className="font-bold text-lg">すべての問題</span>
            <span className="text-sm text-gray-500">全{quizData.length}問 <ChevronRight size={18} className="inline" /></span>
          </button>
          
          <button 
            onClick={() => startQuiz('wrong')}
            disabled={wrongCount === 0}
            className={`w-full bg-white p-4 rounded shadow flex items-center justify-between border-l-4 border-red-500 ${wrongCount === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            <span className="font-bold text-lg">前回不正解のみ</span>
            <span className="text-sm text-gray-500">{wrongCount}問 <ChevronRight size={18} className="inline" /></span>
          </button>

          <button 
            onClick={() => startQuiz('review')}
            disabled={reviewCount === 0}
            className={`w-full bg-white p-4 rounded shadow flex items-center justify-between border-l-4 border-yellow-500 ${reviewCount === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            <span className="font-bold text-lg">要復習のみ</span>
            <span className="text-sm text-gray-500">{reviewCount}問 <ChevronRight size={18} className="inline" /></span>
          </button>

          <button 
            onClick={() => setScreen('history')}
            className="w-full bg-blue-600 text-white p-4 rounded shadow hover:bg-blue-700 flex items-center justify-center font-bold mt-4"
          >
            <List size={20} className="mr-2" /> 学習履歴を見る
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'history') {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
            <h2 className="text-xl font-bold">学習履歴</h2>
            <button onClick={() => setScreen('menu')} className="p-1 hover:bg-blue-700 rounded"><Home size={24} /></button>
          </div>
          <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto">
            {quizData.map((q) => {
              const h = history[q.id];
              const isFlagged = reviewFlags[q.id];
              return (
                <div key={q.id} className="flex items-center justify-between p-3 border-b border-gray-200">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">{q.year}</div>
                    <div className="font-bold">{q.title}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    {h ? (
                      h.isCorrect ? <span className="text-green-600 font-bold flex items-center"><Check size={18}/> 正解</span> 
                                  : <span className="text-red-600 font-bold flex items-center"><X size={18}/> 不正解</span>
                    ) : (
                      <span className="text-gray-400">未解答</span>
                    )}
                    {isFlagged ? <Bookmark size={20} className="text-yellow-500 fill-yellow-500" /> : <Bookmark size={20} className="text-gray-300" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (screen === 'quiz' && currentList.length > 0) {
    const currentQ = currentList[currentIndex];
    const isReviewFlagged = reviewFlags[currentQ.id] || false;

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div>
              <span className="text-sm opacity-80">{currentQ.year}</span>
              <h2 className="font-bold text-lg">問 {currentIndex + 1} / {currentList.length} - {currentQ.title}</h2>
            </div>
            <button onClick={() => setScreen('menu')} className="p-2 hover:bg-blue-700 rounded" title="メニューに戻る">
              <Home size={20} />
            </button>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <div className="text-gray-800 leading-relaxed mb-6">{currentQ.question}</div>

            {/* Choices */}
            <div className="space-y-3 mb-6">
              {currentQ.choices.map((choice, idx) => {
                let btnClass = "w-full text-left p-4 rounded border flex items-center transition-colors ";
                if (isAnswering) {
                  btnClass += "border-gray-300 hover:bg-blue-50 hover:border-blue-300";
                } else {
                  if (idx === currentQ.answerIndex) {
                    btnClass += "bg-green-100 border-green-500 font-bold";
                  } else if (idx === selectedChoice) {
                    btnClass += "bg-red-100 border-red-500";
                  } else {
                    btnClass += "border-gray-200 opacity-50";
                  }
                }

                return (
                  <button 
                    key={idx} 
                    disabled={!isAnswering}
                    onClick={() => handleAnswer(idx)}
                    className={btnClass}
                  >
                    {!isAnswering && idx === currentQ.answerIndex && <Check className="text-green-600 mr-2 min-w-max" size={20} />}
                    {!isAnswering && idx === selectedChoice && idx !== currentQ.answerIndex && <X className="text-red-600 mr-2 min-w-max" size={20} />}
                    <span className={!isAnswering ? "ml-2" : ""}>{choice}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Area */}
            {!isAnswering && (
              <div className="mt-8 border-t border-gray-200 pt-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">解説</h3>
                  <label className="flex items-center gap-2 cursor-pointer bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200 hover:bg-yellow-100 transition">
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={isReviewFlagged}
                      onChange={toggleReviewFlag}
                    />
                    <Bookmark size={18} className={isReviewFlagged ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                    <span className="text-sm font-semibold text-yellow-700">要復習</span>
                  </label>
                </div>
                
                <div className="bg-gray-50 p-4 rounded text-gray-700 text-sm leading-relaxed mb-6">
                  {currentQ.explanation}
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 flex items-center justify-center shadow"
                >
                  {currentIndex + 1 < currentList.length ? (
                    <>次の問題へ <ChevronRight size={20} className="ml-1" /></>
                  ) : (
                    <>結果一覧に戻る</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}