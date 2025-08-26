#!/usr/bin/env python3
import re
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

def clean_emoji_text(text):
    """Remove emojis do texto mantendo o conteúdo"""
    # Remove emojis comuns
    emoji_pattern = r'[🎯📊✅❌🟡🔴🎉⚠️🚨💡🏆📈🚀🎊📅🎪🔧⭐🌟💪🔥⚡🎭🎨🎵🎸🎤🎬🎮🎲🎳]'
    text = re.sub(emoji_pattern, '', text)
    return text.strip()

def markdown_to_pdf_complete(md_file, pdf_file):
    # Ler o arquivo markdown
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Criar PDF
    doc = SimpleDocTemplate(pdf_file, pagesize=A4, topMargin=72, bottomMargin=72)
    styles = getSampleStyleSheet()
    
    # Criar estilos personalizados
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=24,
        alignment=TA_CENTER,
        textColor=colors.darkblue,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=16,
        spaceAfter=10,
        textColor=colors.darkgreen,
        fontName='Helvetica-Bold'
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=12,
        spaceBefore=12,
        spaceAfter=8,
        textColor=colors.darkred,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        alignment=TA_JUSTIFY,
        fontName='Helvetica'
    )
    
    bold_style = ParagraphStyle(
        'CustomBold',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        alignment=TA_JUSTIFY,
        fontName='Helvetica-Bold'
    )
    
    story = []
    
    # Dividir o conteúdo por linhas
    lines = content.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if not line:
            i += 1
            continue
            
        # Título principal (H1)
        if line.startswith('# '):
            text = clean_emoji_text(line[2:])
            story.append(Paragraph(text, title_style))
            story.append(Spacer(1, 20))
            
        # Subtítulos (H2)
        elif line.startswith('## '):
            text = clean_emoji_text(line[3:])
            story.append(Paragraph(text, heading_style))
            story.append(Spacer(1, 12))
            
        # Sub-subtítulos (H3)
        elif line.startswith('### '):
            text = clean_emoji_text(line[4:])
            story.append(Paragraph(text, subheading_style))
            story.append(Spacer(1, 8))
            
        # Linhas horizontais
        elif line.startswith('---'):
            story.append(Spacer(1, 10))
            story.append(Paragraph('_' * 80, normal_style))
            story.append(Spacer(1, 10))
            
        # Listas com bullets
        elif line.startswith('- '):
            text = clean_emoji_text(line[2:])
            if '**' in text:
                # Processar texto em negrito
                text = text.replace('**', '<b>', 1).replace('**', '</b>', 1)
                # Processar outros pares de **
                while '**' in text:
                    text = text.replace('**', '<b>', 1).replace('**', '</b>', 1)
            text = f"• {text}"
            story.append(Paragraph(text, normal_style))
            
        # Listas numeradas
        elif re.match(r'^\d+\.', line):
            text = clean_emoji_text(line)
            if '**' in text:
                # Processar texto em negrito
                while '**' in text:
                    text = text.replace('**', '<b>', 1).replace('**', '</b>', 1)
            story.append(Paragraph(text, normal_style))
            
        # Parágrafos normais
        elif line and not line.startswith('#'):
            text = clean_emoji_text(line)
            
            # Processar texto em negrito
            if '**' in text:
                while '**' in text:
                    text = text.replace('**', '<b>', 1).replace('**', '</b>', 1)
            
            # Processar código inline
            if '`' in text:
                text = text.replace('`', '<font name="Courier"><i>').replace('`', '</i></font>')
                # Fix se houver número ímpar de `
                if text.count('<font name="Courier"><i>') != text.count('</i></font>'):
                    text = text.replace('<font name="Courier"><i>', '`').replace('</i></font>', '')
            
            if text.strip():
                story.append(Paragraph(text, normal_style))
                story.append(Spacer(1, 4))
        
        i += 1
    
    # Construir PDF
    doc.build(story)
    print(f"PDF completo criado com sucesso: {pdf_file}")

if __name__ == "__main__":
    try:
        markdown_to_pdf_complete("STATUS_HOMOLOGACAO_IFOOD.md", "STATUS_HOMOLOGACAO_IFOOD_COMPLETO.pdf")
    except Exception as e:
        print(f"Erro ao converter: {e}")